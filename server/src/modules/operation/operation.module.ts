import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule } from '@/config/app/config.module.js';
import { GroupOperationEntity } from '@/operation/group-operation.entity.js';
import { GroupOperationRepositoryProvider } from '@/operation/group-operation.repository.js';
import { OperationRepositoryProvider } from '@/operation/operation.repository.js';
import { ProductBatchModule } from '@/product-batch/product-batch.module.js';
import { ProductBatchGroupModule } from '@/product-batch-group/product-batch-group.module.js';

import { OperationEntity } from './operation.entity.js';
import { OperationService } from './operation.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([OperationEntity, GroupOperationEntity]),
    AppConfigModule,
    CqrsModule,
    ProductBatchModule,
    ProductBatchGroupModule,
  ],
  providers: [
    OperationService,
    OperationRepositoryProvider,
    GroupOperationRepositoryProvider,
  ],
  exports: [OperationService],
})
export class OperationModule {}
