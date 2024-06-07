import { Inject, Injectable } from '@nestjs/common';
import {
  getDataSourceToken,
  InjectDataSource,
  InjectRepository,
} from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import type {
  CreateOperationInput,
  CreateOperationResponse,
} from '@/graphql.schema.js';
import { OperationEntity } from '@/operation/operation.entity.js';

import { ProductBatchOperationEntity } from './product-batch-operation.entity.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';

@Injectable()
export class ProductBatchOperationService {
  constructor(
    @InjectRepository(ProductBatchOperationEntity)
    private readonly repository: Repository<ProductBatchOperationEntity>,
    @InjectDataSource()
    private dataSource: CustomDataSource,
  ) {}

  async createOperation(
    input: CreateOperationInput,
  ): Promise<CreateOperationResponse> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let newOperation = new OperationEntity();
      newOperation.date = input.date;
      newOperation.cost = input.cost;
      newOperation.name = input.name;
      newOperation.proportionType = input.proportionType;
      newOperation = await queryRunner.manager.save(newOperation);

      const newItems = input.productBatchProportions.map(
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
      const b = await queryRunner.commitTransaction();
      // await queryRunner.prepareTransaction('aaa');
      // await queryRunner.commitPrepared('aaa2');
      // await queryRunner.query("PREPARE TRANSACTION 'aaa'");
      // await queryRunner.query("COMMIT PREPARED 'aaa'");

      // await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
      return { success: false };
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }

    return { success: true };
  }
}
