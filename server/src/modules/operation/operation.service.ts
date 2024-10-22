import { Injectable } from '@nestjs/common';

import { CustomPostgresQueryRunner } from '@/database/custom.query-runner.js';
import { ProportionType } from '@/operation/dtos/operation.dto.js';
import { GroupOperationReadRepo } from '@/operation/group-operation.read-repo.js';
import { OperationReadEntity } from '@/operation/operation.read-entity.js';
import { OperationReadRepo } from '@/operation/operation.read-repo.js';

@Injectable()
export class OperationService {
  constructor(
    private readonly operationReadRepo: OperationReadRepo,
    private readonly groupOperationRepo: GroupOperationReadRepo,
  ) {}
}
