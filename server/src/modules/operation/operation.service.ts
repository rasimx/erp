import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type {
  CreateOperationInput,
  CreateOperationResponse,
  OperationList,
} from '@/graphql.schema.js';
import {
  OperationEntity,
  type OperationInsertEntity,
} from '@/operation/operation.entity.js';

@Injectable()
export class OperationService {
  constructor(
    @InjectRepository(OperationEntity)
    private readonly repository: Repository<OperationEntity>,
  ) {}

  async operationList(productBatchId: number): Promise<OperationList> {
    const [items, totalCount] = await this.repository.findAndCount({
      where: {},
    });
    return { items, totalCount };
  }
}
