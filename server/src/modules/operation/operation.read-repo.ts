import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OperationReadEntity } from '@/operation/operation.read-entity.js';

export class OperationReadRepo extends Repository<OperationReadEntity> {
  async nextIds(count = 1): Promise<number[]> {
    const rows: { nextval: number }[] = await this.query(
      `SELECT nextval('operation_read_id_seq')::int FROM generate_series(1, ${count.toString()});`,
    );
    return rows.map(item => item.nextval);
  }
  // async createOperationTransaction(dto: CreateOperationDto): Promise<{
  //   commit: () => Promise<void>;
  //   rollback: () => Promise<void>;
  // }> {
  //   const queryRunner = this.manager.queryRunner;
  //
  //   if (!queryRunner) throw new Error('должен быть в транзакции');
  //
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //   try {
  //     let newOperation = new OperationReadEntity();
  //     newOperation.date = dto.date;
  //     newOperation.cost = dto.cost;
  //     newOperation.name = dto.name;
  //     newOperation.proportionType = dto.proportionType;
  //     newOperation = await queryRunner.manager.save(newOperation);
  //
  //     const newItems = dto.productBatchProportions.map(
  //       ({ productBatchId, proportion, cost }) => {
  //         const item = new ProductBatchOperationEntity();
  //         item.operationId = newOperation.id;
  //         item.proportion = proportion;
  //         item.productBatchId = productBatchId;
  //         item.cost = cost;
  //
  //         return item;
  //       },
  //     );
  //
  //     const a = newItems.reduce((prev, cur) => prev + cur.proportion, 0);
  //
  //     if (
  //       newItems.reduce((prev, cur) => prev + cur.proportion, 0).toFixed(0) !==
  //       '100'
  //     ) {
  //       throw new Error('error proportion');
  //     }
  //     await queryRunner.manager.save(newItems);
  //
  //     return {
  //       commit: async () => {
  //         await queryRunner.commitTransaction();
  //         await queryRunner.release();
  //       },
  //       rollback: async () => {
  //         await queryRunner.rollbackTransaction();
  //         await queryRunner.release();
  //       },
  //     };
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //     await queryRunner.release();
  //     throw err;
  //   }
  // }
}

export const OperationReadRepoProvider = {
  provide: OperationReadRepo,
  inject: [getRepositoryToken(OperationReadEntity)],
  useFactory: (repository: Repository<OperationReadEntity>) => {
    return new OperationReadRepo(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
