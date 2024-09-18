import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { CustomDataSource } from '@/database/custom.data-source.js';

import { ProductBatchOperationEntity } from './product-batch-operation.entity.js';

@Injectable()
export class ProductBatchOperationService {
  constructor(
    @InjectRepository(ProductBatchOperationEntity)
    private readonly repository: Repository<ProductBatchOperationEntity>,
    @InjectDataSource()
    private dataSource: CustomDataSource,
  ) {}
}
