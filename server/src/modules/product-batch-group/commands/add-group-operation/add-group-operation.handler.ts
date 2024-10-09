import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Field, Int } from '@nestjs/graphql';
import { InjectDataSource } from '@nestjs/typeorm';
import { v7 as uuidV7 } from 'uuid';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { OperationService } from '@/operation/operation.service.js';
import type { RevisionProductBatchEvent } from '@/product-batch/domain/product-batch.events.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchRepository } from '@/product-batch/domain/product-batch.repository.js';
import { ProductBatchEventRepository } from '@/product-batch/domain/product-batch-event.repository.js';
import { AddGroupOperationCommand } from '@/product-batch-group/commands/add-group-operation/add-group-operation.command.js';
import {
  ProductBatchGroupEventType,
  type RevisionProductBatchGroupEvent,
} from '@/product-batch-group/domain/product-batch-group.events.js';
import { ProductBatchGroup } from '@/product-batch-group/domain/product-batch-group.js';
import { ProductBatchGroupRepository } from '@/product-batch-group/domain/product-batch-group.repository.js';
import { ProductBatchGroupEventEntity } from '@/product-batch-group/domain/product-batch-group-event.entity.js';
import { ProductBatchGroupEventRepository } from '@/product-batch-group/domain/product-batch-group-event.repository.js';
import { RequestRepository } from '@/request/request.repository.js';

// import { ProductBatchEventStore } from '@/product-batch/eventstore/product-batch.eventstore.js';

@CommandHandler(AddGroupOperationCommand)
export class AddGroupOperationHandler
  implements ICommandHandler<AddGroupOperationCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly contextService: ContextService,
    private readonly operationService: OperationService,
    private readonly requestRepo: RequestRepository,
    private readonly productBatchRepo: ProductBatchRepository,
    private readonly productBatchEventRepo: ProductBatchEventRepository,
    private readonly productBatchGroupRepo: ProductBatchGroupRepository,
    private readonly productBatchGroupEventRepo: ProductBatchGroupEventRepository,
  ) {}

  async execute(command: AddGroupOperationCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const { dto } = command;

    const queryRunner = this.dataSource.createQueryRunner();

    const requestRepo = queryRunner.manager.withRepository(this.requestRepo);
    const request = await requestRepo.insert({ id: requestId });

    const productBatchRepo = queryRunner.manager.withRepository(
      this.productBatchRepo,
    );
    const productBatchEventRepo = queryRunner.manager.withRepository(
      this.productBatchEventRepo,
    );
    const productBatchGroupRepo = queryRunner.manager.withRepository(
      this.productBatchGroupRepo,
    );
    const productBatchGroupEventRepo = queryRunner.manager.withRepository(
      this.productBatchGroupEventRepo,
    );

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const groupOperation = await this.operationService.createGroupOperation(
        dto,
        queryRunner,
      );

      const groupOperationEventId = uuidV7();

      let group: ProductBatchGroup | null = null;
      if (dto.groupId) {
        const groupEvents = await productBatchGroupEventRepo.findByAggregateId(
          dto.groupId,
        );
        group = ProductBatchGroup.buildFromEvents(
          groupEvents as RevisionProductBatchGroupEvent[],
        );

        group.addOperation({
          id: groupOperationEventId,
          data: { ...dto, id: groupOperation.id },
        });

        await productBatchGroupEventRepo.saveAggregateEvents({
          aggregates: [group],
          requestId,
        });

        await productBatchGroupRepo.save(group.toObject());
      }

      const productBatchEvents =
        await productBatchEventRepo.findManyByAggregateId(
          dto.items.map(item => item.productBatchId),
        );

      const productBatchMap = new Map(
        [...productBatchEvents.entries()].map(([aggregateId, events]) => [
          aggregateId,
          ProductBatch.buildFromEvents(events as RevisionProductBatchEvent[]),
        ]),
      );

      groupOperation.operations.forEach(operation => {
        const productBatch = productBatchMap.get(operation.productBatchId);
        if (!productBatch) throw new Error('product batch not found');
        productBatch.appendGroupOperation(
          {
            id: operation.id,
            productBatchId: operation.productBatchId,
            name: operation.name,
            cost: operation.cost,
            currencyCost: operation.currencyCost,
            exchangeRate: operation.currencyCost,
            date: operation.date,
            proportion: operation.proportion,
            groupOperationCost: dto.cost,
            groupOperationId: groupOperation.id,
          },
          { groupOperationEventId },
        );
      });

      const operationEvents = await productBatchEventRepo.saveAggregateEvents({
        aggregates: [...productBatchMap.values()],
        requestId,
      });

      await productBatchRepo.save(
        [...productBatchMap.values()].map(item => item.toObject()),
      );

      if (!group) {
        const event = new ProductBatchGroupEventEntity();
        event.id = groupOperationEventId;
        event.requestId = requestId;
        event.aggregateId = null;
        event.type = ProductBatchGroupEventType.GroupOperationAdded;
        event.revision = null;
        event.data = { ...dto, id: groupOperation.id };

        event.metadata = { childEvents: operationEvents.map(item => item.id) };

        await productBatchGroupEventRepo.save(event);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
