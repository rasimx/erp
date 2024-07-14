import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductBatchOperationEntity } from './product-batch-operation.entity.js';
import { ProductBatchOperationService } from './product-batch-operation.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProductBatchOperationEntity])],
  providers: [ProductBatchOperationService],
})
export class ProductBatchOperationModule {}
