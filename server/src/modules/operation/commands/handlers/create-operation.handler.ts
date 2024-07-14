import { NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { In } from 'typeorm';

import type { CustomDataSource } from '@/database/custom.data-source.js';
import { CreateOperationCommand } from '@/operation/commands/impl/create-operation.command.js';
import { OperationEntity } from '@/operation/operation.entity.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchOperationEntity } from '@/product-batch-operation/product-batch-operation.entity.js';

@CommandHandler(CreateOperationCommand)
export class CreateOperationHandler
  implements ICommandHandler<CreateOperationCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
  ) {}

  async execute(command: CreateOperationCommand) {
    const queryRunner = this.dataSource.createQueryRunner();

    const { dto } = command;

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let newOperation = new OperationEntity();
      newOperation.date = dto.date;
      newOperation.cost = dto.cost * 100;
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

          productBatch.operationsPricePerUnit += cost / productBatch.count;
          productBatch.operationsPrice = cost;
          return productBatch;
        }),
      );

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
