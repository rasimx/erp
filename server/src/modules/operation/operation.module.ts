import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule } from '@/config/app/config.module.js';
import { CreateOperationHandler } from '@/operation/commands/handlers/create-operation.handler.js';
import { OperationResolver } from '@/operation/operation.resolver.js';
import { ProductBatchModule } from '@/product-batch/product-batch.module.js';
import { ProductBatchGroupModule } from '@/product-batch-group/product-batch-group.module.js';

import { OperationEntity } from './operation.entity.js';
import { OperationService } from './operation.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([OperationEntity]),
    AppConfigModule,
    CqrsModule,
    ProductBatchModule,
    ProductBatchGroupModule,
  ],
  providers: [OperationService, CreateOperationHandler, OperationResolver],
})
export class OperationModule {}
