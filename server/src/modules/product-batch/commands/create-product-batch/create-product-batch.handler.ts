import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import type { ProductEntity } from '@/product/domain/product.entity.js';
import type {
  ProductEvent,
  RevisionProductEvent,
} from '@/product/domain/product.events.js';
import { Product } from '@/product/domain/product.js';
import { ProductRepository } from '@/product/domain/product.repository.js';
import { ProductEventRepository } from '@/product/domain/product-event.repository.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchRepository } from '@/product-batch/domain/product-batch.repository.js';
import { ProductBatchEventRepository } from '@/product-batch/domain/product-batch-event.repository.js';
import { ProductBatchGroupService } from '@/product-batch-group/product-batch-group.service.js';
import { RequestRepository } from '@/request/request.repository.js';

import { CreateProductBatchCommand } from './create-product-batch.command.js';

@CommandHandler(CreateProductBatchCommand)
export class CreateProductBatchHandler
  implements ICommandHandler<CreateProductBatchCommand>
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
  ) {}

  async execute(command: CreateProductBatchCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

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

    try {
      const { dto } = command;

      if (dto.grouped) {
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

      const productEvents = await productEventRepo.findManyByAggregateId(
        dto.items.map(({ productId }) => productId),
      );
      const productsMap = new Map<number, Product>(
        [...productEvents.entries()].map(([productId, productEvents]) => [
          productId,
          Product.buildFromEvents(productEvents as RevisionProductEvent[]),
        ]),
      );

      // const productsEntities = await productRepo.find({
      //   relations: ['setItems'],
      // });
      //
      // const products = productsEntities.map(entity => {
      //   return Product.create({
      //     id: entity.id,
      //     name: entity.name,
      //     sku: entity.sku,
      //     width: entity.width,
      //     height: entity.height,
      //     length: entity.length,
      //     weight: entity.weight,
      //     setItems: entity.setItems.map(item => ({
      //       productId: item.productId,
      //       qty: item.qty,
      //     })),
      //   });
      // });
      //
      // await productEventRepo.saveAggregateEvents({
      //   aggregates: products,
      //   requestId,
      // });

      const affectedIds: number[] = [];

      const aggregatedIds = await productBatchRepo.nextIds(dto.items.length);

      const lastOrder = dto.groupId
        ? null
        : await productBatchRepo.getLastOrderInStatus(dto.statusId);

      const aggregates: ProductBatch[] = [];

      for (let index = 0; index < dto.items.length; ++index) {
        const aggregateId = aggregatedIds.shift();
        if (!aggregateId) throw new Error('aggregateId was not defined');

        const item = dto.items[index];

        const product = productsMap.get(item.productId);
        if (!product) throw new Error('productId was not found');

        const order = lastOrder ? lastOrder + index + 1 : index + 1;

        const productBatch = ProductBatch.create({
          ...item,
          id: aggregateId,
          exchangeRate: dto.exchangeRate,
          statusId: dto.groupId ? null : dto.statusId,
          groupId: dto.groupId,
          order,
          productProps: product.toObject(),
        });

        aggregates.push(productBatch);
      }

      await productBatchEventRepo.saveAggregateEvents({
        aggregates,
        requestId,
      });

      await productBatchRepo.save(aggregates.map(item => item.toObject()));

      // await this.productBatchService.relinkPostings({
      //   queryRunner,
      //   affectedIds,
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