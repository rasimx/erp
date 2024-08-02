import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { OzonPostingProductMicroservice } from '@/microservices/erp_ozon/ozon-posting-product-microservice.service.js';
import type { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchEventStore } from '@/product-batch/product-batch.eventstore.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { StatusRepository } from '@/status/status.repository.js';

import { DeleteProductBatchCommand } from '../impl/delete-product-batch.command.js';

@CommandHandler(DeleteProductBatchCommand)
export class DeleteProductBatchHandler
  implements ICommandHandler<DeleteProductBatchCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
    private readonly contextService: ContextService,
    private readonly ozonPostingProductMicroservice: OzonPostingProductMicroservice,
    private readonly statusRepository: StatusRepository,
  ) {}

  async execute(command: DeleteProductBatchCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { id } = command;
      const productBatchRepository = queryRunner.manager.withRepository(
        this.productBatchRepository,
      );

      const entity = await productBatchRepository.findOneOrFail({
        where: { id },
        relations: ['status', 'group', 'group.status'],
      });
      const storeId = entity.status?.storeId ?? entity.group?.status.storeId;

      let batchesForRelinkMap = new Map<number, ProductBatchEntity[]>();
      if (storeId) {
        batchesForRelinkMap = await productBatchRepository.findLatest({
          items: [
            {
              productId: entity.productId,
              productBatchIds: [entity.id],
            },
          ],
          storeId,
        });
      }

      await productBatchRepository.softDelete({ id });

      const batchesForRelink = batchesForRelinkMap.get(entity.productId);
      if (storeId && batchesForRelink) {
        const { success } =
          await this.ozonPostingProductMicroservice.relinkPostings({
            items: [
              {
                storeId,
                items: [
                  {
                    baseProductId: entity.productId,
                    productBatches: batchesForRelink.map(item => ({
                      ...item,
                      count: item.id == entity.id ? 0 : item.count,
                    })),
                  },
                ],
              },
            ],
          });
        if (!success) throw new Error('relink error');
      }

      await this.productBatchEventStore.deleteProductBatch({
        eventId: requestId,
        productBatchId: id,
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
