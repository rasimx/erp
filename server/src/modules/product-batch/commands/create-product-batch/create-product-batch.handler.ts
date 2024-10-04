import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchRepository } from '@/product-batch/domain/product-batch.repository.js';
import { ProductBatchEventRepository } from '@/product-batch/domain/product-batch-event.repository.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { ProductBatchGroupService } from '@/product-batch-group/product-batch-group.service.js';

import { CreateProductBatchCommand } from './create-product-batch.command.js';

@CommandHandler(CreateProductBatchCommand)
export class CreateProductBatchHandler
  implements ICommandHandler<CreateProductBatchCommand>
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

  async execute(command: CreateProductBatchCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const productBatchRepository = queryRunner.manager.withRepository(
      this.productBatchRepository,
    );
    const productBatchEventRepository = queryRunner.manager.withRepository(
      this.productBatchEventRepository,
    );

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
        dto.items.length,
      );

      for (const item of dto.items) {
        const aggregateId = aggregatedIds.shift();
        const productBatch = ProductBatch.create({
          ...item,
          id: aggregateId,
          exchangeRate: dto.exchangeRate,
          statusId: dto.statusId,
          groupId: dto.groupId,
        });

        await productBatchEventRepository.saveAggregateEvents({
          aggregate: productBatch,
          eventId: requestId,
        });

        await productBatchRepository.save(productBatch.toObject());
      }

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
