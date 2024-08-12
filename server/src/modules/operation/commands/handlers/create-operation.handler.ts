import { NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { In } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { CreateOperationCommand } from '@/operation/commands/impl/create-operation.command.js';
import { OperationEntity } from '@/operation/operation.entity.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchEventStore } from '@/product-batch/product-batch.eventstore.js';
import { ProductBatchGroupEventStore } from '@/product-batch-group/prodict-batch-group.eventstore.js';
import { ProductBatchOperationEntity } from '@/product-batch-operation/product-batch-operation.entity.js';

@CommandHandler(CreateOperationCommand)
export class CreateOperationHandler
  implements ICommandHandler<CreateOperationCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly contextService: ContextService,
    private readonly productBatchEventStore: ProductBatchEventStore,
    private readonly productBatchGroupEventStore: ProductBatchGroupEventStore,
  ) {}

  async execute(command: CreateOperationCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const { dto } = command;

    if (!dto.groupId && dto.productBatchProportions.length > 1) {
      throw new Error("maybe it's group");
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let newOperation = new OperationEntity();
      newOperation.date = dto.date;
      newOperation.cost = dto.cost;
      newOperation.name = dto.name;
      newOperation.groupId = dto.groupId;
      newOperation.proportionType = dto.proportionType;
      newOperation = await queryRunner.manager.save(newOperation);

      const newItems = dto.productBatchProportions.map(
        ({ productBatchId, proportion, cost }) => {
          const item = new ProductBatchOperationEntity();
          item.operationId = newOperation.id;
          item.proportion = proportion;
          item.productBatchId = productBatchId;
          item.cost = cost;

          return item;
        },
      );

      const productBatchList = await queryRunner.manager.find(
        ProductBatchEntity,
        {
          where: {
            id: In(
              dto.productBatchProportions.map(
                ({ productBatchId }) => productBatchId,
              ),
            ),
          },
        },
      );

      if (
        newItems.reduce((prev, cur) => prev + cur.proportion, 0).toFixed(0) !==
        '100'
      ) {
        throw new Error('error proportion');
      }
      await queryRunner.manager.save(newItems);

      const productBatchMap = new Map(
        productBatchList.map(item => [item.id, item]),
      );

      await queryRunner.manager.save(
        dto.productBatchProportions.map(({ productBatchId, cost }) => {
          const productBatch = productBatchMap.get(productBatchId);
          if (!productBatch)
            throw new NotFoundException(
              `Product batch id ${productBatchId.toString()} not found`,
            );

          const operationPricePerUnit = cost / productBatch.count;

          productBatch.operationsPricePerUnit += Number(
            operationPricePerUnit.toFixed(0),
          );
          productBatch.operationsPrice = cost;
          return productBatch;
        }),
      );

      if (dto.groupId) {
        await this.productBatchGroupEventStore.createOperation({
          eventId: requestId,
          productBatchGroupId: dto.groupId,
          dto,
        });
      } else {
        await this.productBatchEventStore.createOperation({
          eventId: requestId,
          productBatchId: dto.productBatchProportions[0].productBatchId,
          dto,
        });
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
