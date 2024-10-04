import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import pick from 'lodash/pick.js';
import { In } from 'typeorm';

import { assembleProduct } from '@/common/assembleProduct.js';
import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductEventStore } from '@/product/eventstore/product.eventstore.js';
import { ProductRepository } from '@/product/product.repository.js';
import { CreateProductBatchesByAssemblingCommand } from '@/product-batch/commands/create-product-batches-by-assembling/create-product-batches-by-assembling.command.js';
import type { ProductBatchEntity } from '@/product-batch/domain/product-batch.entity.js';
import { ProductBatchRepository } from '@/product-batch/domain/product-batch.repository.js';
import { ProductBatchEventStore } from '@/product-batch/eventstore/product-batch.eventstore.js';
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
    private readonly productEventStore: ProductEventStore,
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

    const cancels: (() => Promise<void>)[] = [];

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

      let newEntities: ProductBatchEntity[] = [];
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

      newEntities = await productBatchRepository.find({
        where: { id: In(newEntities.map(({ id }) => id)) },
        relations: ['sourcesClosure'],
      });

      await this.productBatchService.relinkPostings({
        queryRunner,
        affectedIds,
      });

      for (const entity of newEntities) {
        const eventData = {
          ...pick(entity, [
            'id',
            'count',
            'productId',
            'groupId',
            'operationsPrice',
            'operationsPricePerUnit',
            'statusId',
            'costPricePerUnit',
            'currencyCostPricePerUnit',
            'exchangeRate',
          ]),
          sources: entity.sourcesClosure.map(item => ({
            id: item.sourceId,
            count: item.count,
            qty: item.qty,
          })),
        };
        const { appendResult, cancel } =
          await this.productBatchEventStore.appendProductBatchCreatedByAssemblingEvent(
            {
              eventId: requestId,
              data: eventData,
            },
          );

        if (!appendResult.success) throw new Error('????');
        cancels.push(cancel);

        const { appendResult: productAppendResult, cancel: productCancel } =
          await this.productEventStore.appendProductBatchCreatedByAssemblingEvent(
            {
              eventId: requestId,
              productId: entity.productId,
              data: eventData,
            },
          );

        if (!productAppendResult.success) throw new Error('????');
        cancels.push(productCancel);

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

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      for (const cancel of cancels) {
        await cancel();
      }
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
