import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { type FindOptionsWhere, In } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { OzonPostingProductMicroservice } from '@/microservices/erp_ozon/ozon-posting-product-microservice.service.js';
import { MoveProductBatchCommand } from '@/product-batch/commands/impl/move-product-batch.command.js';
import type { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchEventStore } from '@/product-batch/product-batch.eventstore.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { ProductBatchGroupRepository } from '@/product-batch-group/product-batch-group.repository.js';
import { StatusRepository } from '@/status/status.repository.js';

@CommandHandler(MoveProductBatchCommand)
export class MoveProductBatchHandler
  implements ICommandHandler<MoveProductBatchCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchGroupRepository: ProductBatchGroupRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
    private readonly contextService: ContextService,
    private readonly statusRepository: StatusRepository,
    private readonly ozonPostingProductMicroservice: OzonPostingProductMicroservice,
  ) {}

  async execute(command: MoveProductBatchCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { dto } = command;

      const productBatchRepository = queryRunner.manager.withRepository(
        this.productBatchRepository,
      );

      const productBatchGroupRepository = queryRunner.manager.withRepository(
        this.productBatchGroupRepository,
      );

      const oldVersion = await productBatchRepository.findOneOrFail({
        where: { id: dto.id },
        relations: ['status', 'group', 'group.status'],
      });

      const {
        id,
        statusId,
        oldStatusId,
        oldOrder,
        order: newOrder,
        affectedIds,
      } = await productBatchRepository.moveProductBatch(dto);
      let affectedGroupIds: number[] | undefined;
      if (statusId && oldStatusId) {
        affectedGroupIds = await productBatchGroupRepository.moveOthers({
          statusId,
          oldStatusId,
          order: newOrder,
          oldOrder,
        });
      }

      const where: FindOptionsWhere<ProductBatchEntity>[] = [
        { id: In([id, ...affectedIds]) },
      ];

      if (affectedGroupIds?.length) {
        where.push({ groupId: In(affectedGroupIds) });
      }

      const affectedProductBatches = await productBatchRepository.find({
        where,
        relations: ['status', 'group', 'group.status'],
      });

      const map = new Map<number, Map<number, number[]>>(); //storeId

      affectedProductBatches.forEach(item => {
        const storeId = item.status?.storeId ?? item.group?.status.storeId;
        if (storeId) {
          const storeMapItem = map.get(storeId) ?? new Map<number, number[]>();
          const productMapItem = storeMapItem.get(item.productId) ?? [];
          productMapItem.push(item.id);
          storeMapItem.set(item.productId, productMapItem);
          map.set(storeId, storeMapItem);
        }
      });

      const oldVersionStoreId =
        oldVersion.status?.storeId ?? oldVersion.group?.status.storeId;

      const storeMap = new Map<number, Map<number, ProductBatchEntity[]>>();
      if (map.size) {
        for (const [storeId, subMap] of map.entries()) {
          const batchesForRelinkMap = await productBatchRepository.findLatest({
            items: [...subMap.entries()].map(
              ([productId, productBatchIds]) => ({
                productId,
                productBatchIds,
              }),
            ),
            storeId,
          });
          storeMap.set(storeId, batchesForRelinkMap);
        }
      }
      if (
        oldVersionStoreId &&
        !storeMap
          .get(oldVersionStoreId)
          ?.get(oldVersion.productId)
          ?.find(item => item.id == oldVersion.id)
      ) {
        const storeMapItem =
          storeMap.get(oldVersionStoreId) ??
          new Map<number, ProductBatchEntity[]>();
        const productMapItem = storeMapItem.get(oldVersion.productId) ?? [];
        productMapItem.push({ ...oldVersion, count: 0 } as ProductBatchEntity);
        storeMapItem.set(oldVersion.productId, productMapItem);
        storeMap.set(oldVersionStoreId, storeMapItem);
      }
      if (storeMap.size) {
        const { success } =
          await this.ozonPostingProductMicroservice.relinkPostings({
            items: [...storeMap.entries()].map(([storeId, mapByProductId]) => ({
              storeId,
              items: [...mapByProductId.entries()].map(
                ([baseProductId, productBatches]) => ({
                  baseProductId,
                  productBatches,
                }),
              ),
            })),
          });
        if (!success) throw new Error('relink error');
      }

      await this.productBatchEventStore.moveProductBatch({
        eventId: requestId,
        dto,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
