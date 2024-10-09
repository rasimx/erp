import { Injectable } from '@nestjs/common';

import { CustomPostgresQueryRunner } from '@/database/custom.query-runner.js';
import { ProportionType } from '@/operation/dtos/operation.dto.js';
import { GroupOperationRepository } from '@/operation/group-operation.repository.js';
import { OperationEntity } from '@/operation/operation.entity.js';
import { OperationRepository } from '@/operation/operation.repository.js';

@Injectable()
export class OperationService {
  constructor(
    private readonly operationRepo: OperationRepository,
    private readonly groupOperationRepo: GroupOperationRepository,
  ) {}

  async createOperations(
    dataItems: {
      name: string;
      cost: number;
      currencyCost: number | null;
      exchangeRate: number | null;
      date: string;
      productBatchId: number;
    }[],
    queryRunner: CustomPostgresQueryRunner,
  ) {
    const operationRepo = queryRunner.manager.withRepository(
      this.operationRepo,
    );

    return await operationRepo.save(
      dataItems.map(item => {
        const operation = new OperationEntity();
        Object.assign(operation, item);
        return operation;
      }),
    );
  }

  async createGroupOperation(
    data: {
      name: string;
      cost: number;
      currencyCost: number | null;
      exchangeRate: number | null;
      groupId: number | null;
      date: string;
      proportionType: ProportionType;
      items: {
        productBatchId: number;
        proportion: number;
        cost: number;
      }[];
    },
    queryRunner: CustomPostgresQueryRunner,
  ) {
    const groupOperationRepo = queryRunner.manager.withRepository(
      this.groupOperationRepo,
    );

    const groupOperation = await groupOperationRepo.save({ ...data });

    const operationRepo = queryRunner.manager.withRepository(
      this.operationRepo,
    );

    groupOperation.operations = await operationRepo.save(
      data.items.map(item => {
        const operation = new OperationEntity();
        Object.assign(operation, data, { ...item }, { groupOperation });
        return operation;
      }),
    );

    return groupOperation;
  }
}
