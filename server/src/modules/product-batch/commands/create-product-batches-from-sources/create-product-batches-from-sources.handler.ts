import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { In } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import type { ProductEntity } from '@/product/domain/product.entity.js';
import type { RevisionProductEvent } from '@/product/domain/product.events.js';
import { Product } from '@/product/domain/product.js';
import { ProductRepository } from '@/product/domain/product.repository.js';
import { ProductEventRepository } from '@/product/domain/product-event.repository.js';
import type { RevisionProductBatchEvent } from '@/product-batch/domain/product-batch.events.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchRepository } from '@/product-batch/domain/product-batch.repository.js';
import { ProductBatchEventRepository } from '@/product-batch/domain/product-batch-event.repository.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { ProductBatchGroupService } from '@/product-batch-group/product-batch-group.service.js';
import { RequestRepository } from '@/request/request.repository.js';

import { CreateProductBatchesFromSourcesCommand } from './create-product-batches-from-sources.command.js';

@CommandHandler(CreateProductBatchesFromSourcesCommand)
export class CreateProductBatchesFromSourcesHandler
  implements ICommandHandler<CreateProductBatchesFromSourcesCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly requestRepo: RequestRepository,
    private readonly productRepo: ProductRepository,
    private readonly productEventRepo: ProductEventRepository,
    private readonly productBatchRepo: ProductBatchRepository,
    private readonly productBatchEventRepo: ProductBatchEventRepository,
    private readonly productBatchGroupService: ProductBatchGroupService,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: CreateProductBatchesFromSourcesCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    const requestRepo = queryRunner.manager.withRepository(this.requestRepo);
    const request = await requestRepo.insert({ id: requestId });

    const productRepo = queryRunner.manager.withRepository(this.productRepo);
    const productEventRepo = queryRunner.manager.withRepository(
      this.productEventRepo,
    );
    const productBatchRepo = queryRunner.manager.withRepository(
      this.productBatchRepo,
    );
    const productBatchEventRepo = queryRunner.manager.withRepository(
      this.productBatchEventRepo,
    );

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { dto } = command;

      if (dto.grouped) {
        if (!dto.statusId) throw new Error('dto.statusId was not defined');
        if (!dto.groupName) throw new Error('dto.groupName was not defined');

        const group = await this.productBatchGroupService.create({
          requestId,
          queryRunner,
          dto: {
            statusId: dto.statusId,
            name: dto.groupName,
          },
        });

        dto.groupId = group.id;
      }

      const affectedIds: number[] = [];

      const aggregatedIds = await productBatchRepo.nextIds(dto.items.length);

      const lastOrder = dto.groupId
        ? null
        : await productBatchRepo.getLastOrderInStatus(dto.statusId);

      const sourcesEvents = await productBatchEventRepo.findManyByAggregateId(
        dto.items.flatMap(item => item.sourceIds),
      );

      const sourceBathesMap = new Map(
        [...sourcesEvents.entries()].map(([aggregateId, events]) => [
          aggregateId,
          ProductBatch.buildFromEvents(events as RevisionProductBatchEvent[]),
        ]),
      );

      // const products = await productRepo.find({
      //   where: { id: In(dto.items.map(({ productId }) => productId)) },
      //   relations: ['setItems'],
      // });
      // const productsMap = new Map<number, ProductEntity>(
      //   products.map(product => [product.id, product]),
      // );

      const productEvents = await productEventRepo.findManyByAggregateId(
        dto.items.map(({ productId }) => productId),
      );
      const productsMap = new Map<number, Product>(
        [...productEvents.entries()].map(([productId, productEvents]) => [
          productId,
          Product.buildFromEvents(productEvents as RevisionProductEvent[]),
        ]),
      );

      const aggregates: ProductBatch[] = [];

      for (let index = 0; index < dto.items.length; ++index) {
        const aggregateId = aggregatedIds.shift();
        if (!aggregateId) throw new Error('aggregateId was not defined');

        const item = dto.items[index];

        const order = lastOrder ? lastOrder + index + 1 : index + 1;

        const product = productsMap.get(item.productId);
        if (!product) throw new Error('productId was not found');

        const newProductBatch = ProductBatch.createFromSources({
          id: aggregateId,
          count: item.count,
          productProps: product.toObject(),
          statusId: dto.groupId ? null : dto.statusId,
          groupId: dto.groupId,
          order,
          sources: item.sourceIds.map(sourceId => {
            const sourceAggregate = sourceBathesMap.get(sourceId);
            if (!sourceAggregate)
              throw new Error('sourceAggregate was not found');
            // todo: проверить productId через productSet
            const qty = product.toObject().setItems.length
              ? product
                  .toObject()
                  .setItems.find(
                    item => item.productId === sourceAggregate.getProductId(),
                  )?.qty || 1
              : 1;

            return {
              qty,
              productBatch: sourceAggregate,
            };
          }),
        });
        aggregates.push(newProductBatch);
      }

      await productBatchEventRepo.saveAggregateEvents({
        aggregates: [...aggregates, ...sourceBathesMap.values()],
        requestId,
      });

      await productBatchRepo.upsert(
        [...sourceBathesMap.values(), ...aggregates].map(item =>
          item.toObject(),
        ),
        ['id'],
      );

      // await this.productBatchService.relinkPostings({
      //   queryRunner,
      //   affectedIds,
      // });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
