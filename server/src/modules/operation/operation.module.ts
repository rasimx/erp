import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule } from '@/config/app/config.module.js';
import { GroupOperationReadEntity } from '@/operation/group-operation.read-entity.js';
import { GroupOperationReadRepoProvider } from '@/operation/group-operation.read-repo.js';
import { OperationReadRepoProvider } from '@/operation/operation.read-repo.js';
import { ProductBatchModule } from '@/product-batch/product-batch.module.js';
import { ProductBatchGroupModule } from '@/product-batch-group/product-batch-group.module.js';

import { OperationReadEntity } from './operation.read-entity.js';
import { OperationService } from './operation.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([OperationReadEntity, GroupOperationReadEntity]),
    AppConfigModule,
    CqrsModule,
    ProductBatchModule,
    ProductBatchGroupModule,
  ],
  providers: [
    OperationService,
    OperationReadRepoProvider,
    GroupOperationReadRepoProvider,
  ],
  exports: [
    OperationService,
    OperationReadRepoProvider,
    GroupOperationReadRepoProvider,
  ],
})
export class OperationModule {}
