import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule } from '@/config/app/config.module.js';
import { ContextModule } from '@/context/context.module.js';
import { EventStoreModule } from '@/event-store/event-store.module.js';
import { Microservices } from '@/microservices/microservices.js';
import { OperationModule } from '@/operation/operation.module.js';
import { ProductModule } from '@/product/product.module.js';
import { ProductBatchModule } from '@/product-batch/product-batch.module.js';
import { AddGroupOperationHandler } from '@/product-batch-group/commands/add-group-operation/add-group-operation.handler.js';
import { CreateProductBatchGroupHandler } from '@/product-batch-group/commands/create-product-batch-group/create-product-batch-group.handler.js';
import { ProductBatchGroupEventEntity } from '@/product-batch-group/domain/product-batch-group-event.entity.js';
import { ProductBatchGroupEventRepositoryProvider } from '@/product-batch-group/domain/product-batch-group-event.repository.js';
import { GetProductBatchGroupHandler } from '@/product-batch-group/queries/get-product-batch-group/get-product-batch-group.handler.js';
import { RequestModule } from '@/request/request.module.js';
import { StatusModule } from '@/status/status.module.js';

import { DeleteProductBatchGroupHandler } from './commands/delete-product-batch-group/delete-product-batch-group.handler.js';
import { MoveProductBatchGroupHandler } from './commands/move-product-batch-group/move-product-batch-group.handler.js';
import { ProductBatchGroupEntity } from './domain/product-batch-group.entity.js';
import { ProductBatchGroupRepositoryProvider } from './domain/product-batch-group.repository.js';
import { ProductBatchGroupResolver } from './product-batch-group.resolver.js';
import { ProductBatchGroupService } from './product-batch-group.service.js';
import { GetProductBatchGroupListHandler } from './queries/get-product-batch-group-list/get-product-batch-group-list.handler.js';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forFeature([
      ProductBatchGroupEntity,
      ProductBatchGroupEventEntity,
    ]),
    Microservices,
    ProductModule,
    forwardRef(() => ProductBatchModule),
    StatusModule,
    CqrsModule,
    ContextModule,
    EventStoreModule,
    RequestModule,
    forwardRef(() => OperationModule),
  ],
  providers: [
    ProductBatchGroupService,
    ProductBatchGroupResolver,
    GetProductBatchGroupHandler,
    GetProductBatchGroupListHandler,
    CreateProductBatchGroupHandler,
    MoveProductBatchGroupHandler,
    DeleteProductBatchGroupHandler,
    AddGroupOperationHandler,
    ProductBatchGroupRepositoryProvider,
    ProductBatchGroupEventRepositoryProvider,
  ],
  exports: [
    ProductBatchGroupService,
    ProductBatchGroupRepositoryProvider,
    ProductBatchGroupEventRepositoryProvider,
  ],
})
export class ProductBatchGroupModule {}
