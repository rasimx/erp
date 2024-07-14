import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { type QueryRunner, Repository } from 'typeorm';

import type {
  CreateOperationInput,
  CreateOperationResponse,
} from '@/graphql.schema.js';
import type { CreateOperationDto } from '@/operation/dtos/create-operation.dto.js';
import { OperationEntity } from '@/operation/operation.entity.js';
import { ProductBatchOperationEntity } from '@/product-batch-operation/product-batch-operation.entity.js';

export class OperationRepository extends Repository<OperationEntity> {
  async createOperationTransaction(dto: CreateOperationDto): Promise<{
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
  }> {
    const queryRunner = this.manager.queryRunner;

    if (!queryRunner) throw new Error('должен быть в транзакции');

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let newOperation = new OperationEntity();
      newOperation.date = dto.date;
      newOperation.cost = dto.cost;
      newOperation.name = dto.name;
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

      const a = newItems.reduce((prev, cur) => prev + cur.proportion, 0);

      if (
        newItems.reduce((prev, cur) => prev + cur.proportion, 0).toFixed(0) !==
        '100'
      ) {
        throw new Error('error proportion');
      }
      await queryRunner.manager.save(newItems);

      return {
        commit: async () => {
          await queryRunner.commitTransaction();
          await queryRunner.release();
        },
        rollback: async () => {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw err;
    }
  }
}

export const OperationRepositoryProvider = {
  provide: OperationRepository,
  inject: [getRepositoryToken(OperationEntity)],
  useFactory: (repository: Repository<OperationEntity>) => {
    return new OperationRepository(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
