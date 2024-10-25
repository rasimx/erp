import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { GroupOperationReadRepo } from '@/operation/group-operation.read-repo.js';
import { OperationReadRepo } from '@/operation/operation.read-repo.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { AddGroupOperationCommand } from '@/product-batch-group/commands/add-group-operation/add-group-operation.command.js';
import { AbstractProductBatchGroup } from '@/product-batch-group/domain/product-batch-group.js';
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
    private readonly requestRepo: RequestRepository,
    private readonly productBatchService: ProductBatchService,
    private readonly productBatchGroupService: ProductBatchGroupService,
    private readonly operationReadRepo: OperationReadRepo,
    private readonly groupOperationReadRepo: GroupOperationReadRepo,
  ) {}

  async execute(command: AddGroupOperationCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const { dto } = command;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const requestRepo = queryRunner.manager.withRepository(this.requestRepo);
      await requestRepo.insert({ id: requestId });

      const groupOperationReadRepo = queryRunner.manager.withRepository(
        this.groupOperationReadRepo,
      );
      const operationReadRepo = queryRunner.manager.withRepository(
        this.operationReadRepo,
      );

      const groupOperationIds = await groupOperationReadRepo.nextIds(1);
      const groupOperationId = groupOperationIds[0];
      if (!groupOperationId)
        throw new Error('groupOperationId id was not defined');

      const group = dto.groupId
        ? await this.productBatchGroupService.getReadModel({
            id: dto.groupId,
            queryRunner,
          })
        : AbstractProductBatchGroup.createAbstract();

      const groupEvent = group.addGroupOperation({
        ...dto,
        id: groupOperationId,
      });

      await this.productBatchGroupService.saveAggregates({
        aggregates: [group],
        requestId,
        queryRunner,
      });

      const productBatchMap = await this.productBatchService.getReadModelMap({
        ids: dto.items.map(item => item.productBatchId),
        queryRunner,
      });

      const parentAggregates: ProductBatch[] = [];

      const operationIds = await operationReadRepo.nextIds(dto.items.length);

      await Promise.all(
        dto.items.map(async item => {
          let productBatch = productBatchMap.get(item.productBatchId);
          if (!productBatch) throw new Error('product batch not found');

          const newChildBatch =
            await this.productBatchService.shouldSplitAndReturnNewChild({
              productBatch,
              queryRunner,
            });

          if (newChildBatch) {
            parentAggregates.push(productBatch);
            productBatch = newChildBatch;
            productBatchMap.set(item.productBatchId, productBatch); // заменяем оригинал дочерним
          }

          const operationId = operationIds.shift();
          if (!operationId) throw new Error('operationId id was not defined');

          productBatch.appendGroupOperation(
            {
              id: operationId,
              productBatchId: item.productBatchId,
              cost: item.cost,
              proportion: item.proportion,
              name: dto.name,
              currencyCost: dto.currencyCost,
              exchangeRate: dto.exchangeRate,
              date: dto.date,
              groupOperationCost: dto.cost,
              groupOperationId,
            },
            { groupEventId: groupEvent.id },
          );
        }),
      );

      await this.productBatchService.saveAggregates({
        aggregates: [...productBatchMap.values(), ...parentAggregates],
        requestId,
        queryRunner,
      });

      // if (!group) {
      //   const event = new ProductBatchGroupEventEntity();
      //   event.id = groupOperationEventId;
      //   event.requestId = requestId;
      //   event.aggregateId = null;
      //   event.type = ProductBatchGroupEventType.GroupOperationAdded;
      //   event.revision = null;
      //   event.data = { ...dto, id: groupOperationId };
      //
      //   event.metadata = {
      //     childEvents: [...eventEntitiesByAggregateIdMap.values()].flatMap(
      //       items => items.map(item => item.id),
      //     ),
      //   };
      //
      //   await productBatchGroupEventRepo.save(event);
      // }

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
