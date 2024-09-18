import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OperationEntity } from '@/operation/operation.entity.js';

@Injectable()
export class OperationService {
  constructor(
    @InjectRepository(OperationEntity)
    private readonly repository: Repository<OperationEntity>,
  ) {}
}
