import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductService } from '@/product/product.service.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchReadRepo } from '@/product-batch/domain/product-batch.read-repo.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
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
    private readonly productBatchRepo: ProductBatchReadRepo,
    private readonly contextService: ContextService,
    private readonly productService: ProductService,
    private readonly productBatchService: ProductBatchService,
    private readonly productBatchGroupService: ProductBatchGroupService,
  ) {}

  async execute(command: CreateProductBatchCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const productBatchRepo = queryRunner.manager.withRepository(
      this.productBatchRepo,
    );

    try {
      const requestRepo = queryRunner.manager.withRepository(this.requestRepo);
      await requestRepo.insert({ id: requestId });

      const { dto } = command;

      if (dto.grouped) {
        if (!dto.groupName) throw new Error('dto.groupName was not defined');

        const group = await this.productBatchGroupService.create({
          dto: {
            statusId: dto.statusId,
            name: dto.groupName,
          },
          requestId,
          queryRunner,
        });

        dto.groupId = group.id;
      }

      const productsMap = await this.productService.getReadModelMap({
        ids: dto.items.map(({ productId }) => productId),
        queryRunner,
      });

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
          props: {
            ...item,
            initialCount: item.count,
            id: aggregateId,
            exchangeRate: dto.exchangeRate,
            statusId: dto.groupId ? null : dto.statusId,
            groupId: dto.groupId,
            order,
            weight: Number((product.getWeight() * item.count).toFixed(0)),
            volume: Number((product.getVolume() * item.count).toFixed(2)),
          },
        });
        affectedIds.push(aggregateId);

        aggregates.push(productBatch);
      }

      await this.productBatchService.saveAggregates({
        aggregates,
        requestId,
        queryRunner,
      });

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
