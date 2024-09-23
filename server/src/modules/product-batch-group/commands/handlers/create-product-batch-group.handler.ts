import { BadRequestException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { In } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductBatchEventStore } from '@/product-batch/eventstore/product-batch.eventstore.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { CreateProductBatchGroupCommand } from '@/product-batch-group/commands/impl/create-product-batch-group.command.js';
import { ProductBatchGroupEventStore } from '@/product-batch-group/eventstore/prodict-batch-group.eventstore.js';
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
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: CreateProductBatchGroupCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    const cancels: (() => Promise<void>)[] = [];

    try {
      const { dto } = command;

      const productBatchGroupRepository = queryRunner.manager.withRepository(
        this.productBatchGroupRepository,
      );
      const productBatchRepository = queryRunner.manager.withRepository(
        this.productBatchRepository,
      );

      let newEntity = await productBatchGroupRepository.createFromDto(dto);

      const allAffectedIds: number[] = [];
      newEntity = await productBatchGroupRepository.save(newEntity);

      let existProductBatches: ProductBatchEntity[] = [];
      if (dto.existProductBatchIds.length) {
        existProductBatches = await productBatchRepository.find({
          where: { id: In(dto.existProductBatchIds) },
          relations: ['status', 'group', 'group.status'],
          order: { order: 'ASC' },
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
        for (const item of existProductBatches) {
          const { affectedIds } = await productBatchRepository.moveProductBatch(
            {
              id: item.id,
              statusId: null,
              groupId: newEntity.id,
            },
          );
          allAffectedIds.push(...affectedIds, item.id);
        }
      }

      await this.productBatchService.relinkPostings({
        queryRunner,
        affectedIds: allAffectedIds,
        affectedGroupIds: [newEntity.id],
      });

      // EventStore
      const { appendResult, cancel } =
        await this.productBatchGroupEventStore.appendProductBatchGroupCreatedEvent(
          {
            eventId: requestId,
            data: {
              id: newEntity.id,
              ...dto,
            },
          },
        );

      if (!appendResult.success) throw new Error('????');
      cancels.push(cancel);

      if (existProductBatches.length) {
        for (const { id } of existProductBatches) {
          const { appendResult, cancel } =
            await this.productBatchEventStore.appendProductBatchMovedEvent({
              eventId: requestId,
              data: {
                id,
                groupId: newEntity.id,
                statusId: null,
              },
            });
          if (!appendResult.success) throw new Error('????');
          cancels.push(cancel);
        }
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
