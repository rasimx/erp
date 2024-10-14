import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { v7 as uuidV7 } from 'uuid';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { OperationService } from '@/operation/operation.service.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { AddGroupOperationCommand } from '@/product-batch-group/commands/add-group-operation/add-group-operation.command.js';
import { ProductBatchGroupEventEntity } from '@/product-batch-group/domain/product-batch-group.event-entity.js';
import { ProductBatchGroupEventRepo } from '@/product-batch-group/domain/product-batch-group.event-repo.js';
import { ProductBatchGroupEventType } from '@/product-batch-group/domain/product-batch-group.events.js';
import { ProductBatchGroup } from '@/product-batch-group/domain/product-batch-group.js';
import { ProductBatchGroupService } from '@/product-batch-group/product-batch-group.service.js';
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
    private readonly productBatchGroupEventRepo: ProductBatchGroupEventRepo,
    private readonly productBatchService: ProductBatchService,
    private readonly productBatchGroupService: ProductBatchGroupService,
  ) {}

  async execute(command: AddGroupOperationCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const { dto } = command;

    const queryRunner = this.dataSource.createQueryRunner();

    const productBatchGroupEventRepo = queryRunner.manager.withRepository(
      this.productBatchGroupEventRepo,
    );

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const requestRepo = queryRunner.manager.withRepository(this.requestRepo);
      await requestRepo.insert({ id: requestId });

      const groupOperation = await this.operationService.createGroupOperation(
        dto,
        queryRunner,
      );

      const groupOperationEventId = uuidV7();

      let group: ProductBatchGroup | null = null;
      if (dto.groupId) {
        group = await this.productBatchGroupService.getReadModel({
          id: dto.groupId,
          queryRunner,
        });

        group.addOperation({
          id: groupOperationEventId,
          data: { ...dto, id: groupOperation.id },
        });

        await this.productBatchGroupService.saveAggregates({
          aggregates: [group],
          requestId,
          queryRunner,
        });
      }

      const productBatchMap = await this.productBatchService.getReadModelMap({
        ids: dto.items.map(item => item.productBatchId),
        queryRunner,
      });

      const parentAggregates: ProductBatch[] = [];

      await Promise.all(
        groupOperation.operations.map(async operation => {
          let productBatch = productBatchMap.get(operation.productBatchId);
          if (!productBatch) throw new Error('product batch not found');

          const newChildBatch =
            await this.productBatchService.shouldSplitAndReturnNewChild({
              productBatch,
              queryRunner,
            });

          if (newChildBatch) {
            parentAggregates.push(productBatch);
            productBatch = newChildBatch;
            productBatchMap.set(operation.productBatchId, productBatch); // заменяем оригинал дочерним
          }

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
        }),
      );

      const { eventEntitiesByAggregateIdMap } =
        await this.productBatchService.saveAggregates({
          aggregates: [...productBatchMap.values(), ...parentAggregates],
          requestId,
          queryRunner,
        });

      if (!group) {
        const event = new ProductBatchGroupEventEntity();
        event.id = groupOperationEventId;
        event.requestId = requestId;
        event.aggregateId = null;
        event.type = ProductBatchGroupEventType.GroupOperationAdded;
        event.revision = null;
        event.data = { ...dto, id: groupOperation.id };

        event.metadata = {
          childEvents: [...eventEntitiesByAggregateIdMap.values()].flatMap(
            items => items.map(item => item.id),
          ),
        };

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
