import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import type { ProductBatchEntity } from '@/product-batch/domain/product-batch.entity.js';
import type { ProductBatchEvent } from '@/product-batch/domain/product-batch.events.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchRepository } from '@/product-batch/domain/product-batch.repository.js';
import { ProductBatchEventRepository } from '@/product-batch/domain/product-batch-event.repository.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { ProductBatchGroupService } from '@/product-batch-group/product-batch-group.service.js';

import { CreateProductBatchesFromSourcesCommand } from './create-product-batches-from-sources.command.js';

@CommandHandler(CreateProductBatchesFromSourcesCommand)
export class CreateProductBatchesFromSourcesHandler
  implements ICommandHandler<CreateProductBatchesFromSourcesCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchEventRepository: ProductBatchEventRepository,
    private readonly productBatchGroupService: ProductBatchGroupService,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: CreateProductBatchesFromSourcesCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    const productBatchRepository = queryRunner.manager.withRepository(
      this.productBatchRepository,
    );
    const productBatchEventRepository = queryRunner.manager.withRepository(
      this.productBatchEventRepository,
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

        dto.statusId = null;
        dto.groupId = group.id;
      }

      const affectedIds: number[] = [];

      const aggregatedIds = await productBatchRepository.nextIds(
        dto.sources.length,
      );

      for (const sourceItem of dto.sources) {
        const aggregateId = aggregatedIds.shift();
        if (!aggregateId) throw new Error('aggregateId was not defined');

        const events = await productBatchEventRepository.findManyByAggregateId(
          sourceItem.id,
        );
        const sourceProductBatch = ProductBatch.buildFromEvents(
          events as ProductBatchEvent[],
        );

        const newProductBatch = sourceProductBatch.createChild({
          id: aggregateId,
          count: sourceItem.selectedCount,
        });

        await productBatchEventRepository.saveAggregateEvents({
          aggregates: [sourceProductBatch, newProductBatch],
          requestId: requestId,
        });

        // await productBatchRepository.save(productBatch.toObject());

        // newEntities.push(newEntity);
        // affectedIds.push(newEntity.id, sourceBatch.id);
      }

      await this.productBatchService.relinkPostings({
        queryRunner,
        affectedIds,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
