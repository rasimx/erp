import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule } from '@/config/app/config.module.js';
import { EventStoreModule } from '@/event-store/event-store.module.js';
import { Microservices } from '@/microservices/microservices.js';
import { ProductModule } from '@/product/product.module.js';
import { CreateProductBatchHandler } from '@/product-batch/commands/handlers/create-product-batch.handler.js';
import { CreateProductBatchesByAssemblingHandler } from '@/product-batch/commands/handlers/create-product-batches-by-assembling.handler.js';
import { CreateProductBatchesFromSourcesHandler } from '@/product-batch/commands/handlers/create-product-batches-from-sources.handler.js';
import { DeleteProductBatchHandler } from '@/product-batch/commands/handlers/delete-product-batch.handler.js';
import { MoveProductBatchHandler } from '@/product-batch/commands/handlers/move-product-batch.handler.js';
import { ProductBatchEventStore } from '@/product-batch/eventstore/product-batch.eventstore.js';
import { ProductBatchController } from '@/product-batch/product-batch.controller.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchRepositoryProvider } from '@/product-batch/product-batch.repository.js';
import { ProductBatchResolver } from '@/product-batch/product-batch.resolver.js';
import { GetProductBatchHandler } from '@/product-batch/queries/handlers/get-product-batch.handler.js';
import { GetProductBatchListHandler } from '@/product-batch/queries/handlers/get-product-batch-list.handler.js';
import { ProductBatchGroupModule } from '@/product-batch-group/product-batch-group.module.js';
import { StatusModule } from '@/status/status.module.js';

import { ProductBatchService } from './product-batch.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductBatchEntity]),
    AppConfigModule,
    Microservices,
    ProductModule,
    ProductBatchGroupModule,
    StatusModule,
    CqrsModule,
    EventStoreModule,
  ],
  providers: [
    ProductBatchEventStore,
    ProductBatchService,
    ProductBatchResolver,
    GetProductBatchHandler,
    GetProductBatchListHandler,
    MoveProductBatchHandler,
    DeleteProductBatchHandler,
    CreateProductBatchHandler,
    CreateProductBatchesFromSourcesHandler,
    CreateProductBatchesByAssemblingHandler,
    ProductBatchRepositoryProvider,
  ],
  controllers: [ProductBatchController],
  exports: [
    ProductBatchService,
    ProductBatchEventStore,
    ProductBatchRepositoryProvider,
  ],
})
export class ProductBatchModule {}
