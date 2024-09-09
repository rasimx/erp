import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { In } from 'typeorm';

import { assembleProduct } from '@/common/assembleProduct.js';
import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductRepository } from '@/product/product.repository.js';
import { CreateProductBatchesByAssemblingCommand } from '@/product-batch/commands/impl/create-product-batches-by-assembling.command.js';
import { ProductBatchEventStore } from '@/product-batch/eventstore/product-batch.eventstore.js';
import type { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';

@CommandHandler(CreateProductBatchesByAssemblingCommand)
export class CreateProductBatchesByAssemblingHandler
  implements ICommandHandler<CreateProductBatchesByAssemblingCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly productRepository: ProductRepository,
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: CreateProductBatchesByAssemblingCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();
    const productRepository = queryRunner.manager.withRepository(
      this.productRepository,
    );
    const productBatchRepository = queryRunner.manager.withRepository(
      this.productBatchRepository,
    );

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { dto } = command;
      const product = await productRepository.findOneOrFail({
        where: { id: dto.productSetId },
        relations: ['setItems'],
      });
      if (!product.setItems.length)
        throw new Error(`Product ${product.id.toString()} is not Set`);

      const sourceBatches = await productBatchRepository.find({
        where: { id: In(dto.sources.map(({ id }) => id)) },
      });

      const newItems = assembleProduct({
        productSet: product,
        sources: dto.sources,
        fullCount: dto.fullCount,
        productBatches: sourceBatches,
      });

      const newEntities: ProductBatchEntity[] = [];
      const affectedIds: number[] = [];

      for (const newItem of newItems) {
        const { newEntity, sourceProductBatches } =
          await productBatchRepository.createByAssembling({
            ...newItem,
            productSetId: dto.productSetId,
            statusId: dto.statusId,
            groupId: dto.groupId,
          });

        newEntities.push(newEntity);
        affectedIds.push(
          newEntity.id,
          ...sourceProductBatches.map(({ id }) => id),
        );
      }

      await this.productBatchService.relinkPostings({
        queryRunner,
        affectedIds,
      });

      const cancels: (() => Promise<void>)[] = [];
      try {
        for (const entity of newEntities) {
          const { appendResult, cancel } =
            await this.productBatchEventStore.appendProductBatchCreatedByAssemblingEvent(
              {
                eventId: requestId,
                data: {
                  id: entity.id,
                  productId: entity.productId,
                  sources: entity.sourcesClosure.map(item => ({
                    id: item.sourceId,
                    count: item.count,
                    qty: item.qty,
                  })),
                  count: entity.sourcesClosure[0].count,
                  groupId: entity.groupId,
                  costPricePerUnit: entity.costPricePerUnit,
                  operationsPricePerUnit: entity.operationsPricePerUnit,
                  statusId: entity.statusId,
                  operationsPrice: entity.operationsPrice,
                },
              },
            );

          if (!appendResult.success) throw new Error('????');
          cancels.push(cancel);

          await Promise.all(
            entity.sourcesClosure.map(async item => {
              const { appendResult, cancel } =
                await this.productBatchEventStore.appendMoveProductsToChildBatchEvent(
                  {
                    eventId: requestId,
                    data: {
                      id: item.sourceId,
                      count: item.count,
                      destinationID: item.destinationId,
                    },
                  },
                );
              cancels.push(cancel);
              if (!appendResult.success) throw new Error('????');
            }),
          );
        }
      } catch (e) {
        for (const cancel of cancels) {
          await cancel();
        }
        throw e;
      }

      // await this.productBatchEventStore.createProductBatch({
      //   eventId: requestId,
      //   productBatchId: entity.id,
      //   dto,
      // });

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
