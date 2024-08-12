import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule } from '@/config/app/config.module.js';
import { ContextModule } from '@/context/context.module.js';
import { EventStoreModule } from '@/event-store/event-store.module.js';
import { Microservices } from '@/microservices/microservices.js';
import { ProductModule } from '@/product/product.module.js';
import { ProductBatchModule } from '@/product-batch/product-batch.module.js';
import { GetProductBatchGroupHandler } from '@/product-batch-group/queries/handlers/get-product-batch-group.handler.js';
import { StatusModule } from '@/status/status.module.js';

import { CreateProductBatchGroupHandler } from './commands/handlers/create-product-batch-group.handler.js';
import { DeleteProductBatchGroupHandler } from './commands/handlers/delete-product-batch-group.handler.js';
import { MoveProductBatchGroupHandler } from './commands/handlers/move-product-batch-group.handler.js';
import { ProductBatchGroupEventStore } from './prodict-batch-group.eventstore.js';
import { ProductBatchGroupEntity } from './product-batch-group.entity.js';
import { ProductBatchGroupRepositoryProvider } from './product-batch-group.repository.js';
import { ProductBatchGroupResolver } from './product-batch-group.resolver.js';
import { ProductBatchGroupService } from './product-batch-group.service.js';
import { GetProductBatchGroupListHandler } from './queries/handlers/get-product-batch-group-list.handler.js';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forFeature([ProductBatchGroupEntity]),
    Microservices,
    ProductModule,
    forwardRef(() => ProductBatchModule),
    StatusModule,
    CqrsModule,
    ContextModule,
    EventStoreModule,
  ],
  providers: [
    ProductBatchGroupEventStore,
    ProductBatchGroupService,
    ProductBatchGroupResolver,
    GetProductBatchGroupHandler,
    GetProductBatchGroupListHandler,
    CreateProductBatchGroupHandler,
    MoveProductBatchGroupHandler,
    DeleteProductBatchGroupHandler,
    ProductBatchGroupRepositoryProvider,
  ],
  exports: [
    ProductBatchGroupService,
    ProductBatchGroupEventStore,
    ProductBatchGroupRepositoryProvider,
  ],
})
export class ProductBatchGroupModule {}
