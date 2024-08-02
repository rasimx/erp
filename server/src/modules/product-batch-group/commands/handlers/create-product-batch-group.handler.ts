import { BadRequestException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { In } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { OzonPostingProductMicroservice } from '@/microservices/erp_ozon/ozon-posting-product-microservice.service.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchEventStore } from '@/product-batch/product-batch.eventstore.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { CreateProductBatchGroupCommand } from '@/product-batch-group/commands/impl/create-product-batch-group.command.js';
import { ProductBatchGroupEventStore } from '@/product-batch-group/prodict-batch-group.eventstore.js';
import { ProductBatchGroupRepository } from '@/product-batch-group/product-batch-group.repository.js';
import { StatusRepository } from '@/status/status.repository.js';

@CommandHandler(CreateProductBatchGroupCommand)
export class CreateProductBatchGroupHandler
  implements ICommandHandler<CreateProductBatchGroupCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly productBatchGroupRepository: ProductBatchGroupRepository,
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchGroupEventStore: ProductBatchGroupEventStore,
    private readonly productBatchEventStore: ProductBatchEventStore,
    private readonly contextService: ContextService,
    private readonly statusRepository: StatusRepository,
    private readonly ozonPostingProductMicroservice: OzonPostingProductMicroservice,
  ) {}

  async execute(command: CreateProductBatchGroupCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { dto } = command;

      const productBatchGroupRepository = queryRunner.manager.withRepository(
        this.productBatchGroupRepository,
      );
      const productBatchRepository = queryRunner.manager.withRepository(
        this.productBatchRepository,
      );

      let newEntity = await productBatchGroupRepository.createFromDto(dto);

      let existProductBatches: ProductBatchEntity[] = [];

      const a = new Map<number, Map<number, ProductBatchEntity[]>>(); // <storeId, <productId, batch[]>>

      if (dto.existProductBatchIds.length) {
        existProductBatches = await productBatchRepository.find({
          where: { id: In(dto.existProductBatchIds) },
          relations: ['group', 'status'],
        });
        const existIds = existProductBatches.map(({ id }) => id);
        const notFoundIds = dto.existProductBatchIds.filter(
          id => !existIds.includes(id),
        );
        if (notFoundIds.length) {
          throw new BadRequestException(
            `not found batches: ${notFoundIds.join(',')}`,
          );
        }
        existProductBatches.forEach(item => {
          const storeId = item.status?.storeId;
          if (storeId) {
            const storeMapItem =
              a.get(storeId) ?? new Map<number, ProductBatchEntity[]>();
            const productMapItem = storeMapItem.get(item.productId) ?? [];
            productMapItem.push(item);
            storeMapItem.set(item.productId, productMapItem);
            a.set(storeId, storeMapItem);
          }
        });
        newEntity.productBatchList = existProductBatches;
      }
      const newProductBatches: ProductBatchEntity[] = [];
      if (dto.newProductBatches.length) {
        for (const item of dto.newProductBatches) {
          newProductBatches.push(
            await productBatchRepository.createFromDto({
              ...item,
              groupId: newEntity.id,
              statusId: null,
            }),
          );
        }

        newEntity.productBatchList = [
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          ...existProductBatches,
          ...newProductBatches,
        ];
      }
      newEntity = await productBatchGroupRepository.save(newEntity);

      await this.productBatchGroupEventStore.createProductBatchGroup({
        eventId: requestId,
        productBatchGroupId: newEntity.id,
        dto,
      });

      if (newProductBatches.length) {
        for (const newProductBatch of newProductBatches) {
          await this.productBatchEventStore.createProductBatch({
            eventId: requestId,
            productBatchId: newProductBatch.id,
            dto: newProductBatch,
          });
        }
      }
      if (existProductBatches.length) {
        for (const { id } of existProductBatches) {
          await this.productBatchEventStore.moveProductBatch({
            eventId: requestId,
            dto: {
              id,
              groupId: newEntity.id,
              statusId: null,
            },
          });
        }
      }

      const statusRepository = queryRunner.manager.withRepository(
        this.statusRepository,
      );

      const status = await statusRepository.findOneOrFail({
        where: { id: newEntity.statusId },
      });

      // if (status.storeId) {
      //   const { success } =
      //     await this.ozonPostingProductMicroservice.relinkPostings({
      //       storeId: status.storeId,
      //       items: [
      //         {
      //           baseProductId: entity.productId,
      //           productBatches: [entity],
      //         },
      //       ],
      //     });
      //   if (!success) throw new Error('relink error');
      // }

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
