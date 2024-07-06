import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventStoreModule } from '@/event-store/event-store.module.js';
import { Microservices } from '@/microservices/microservices.js';
import { ProductModule } from '@/product/product.module.js';
import { CreateProductBatchHandler } from '@/product-batch/commands/handlers/create-product-batch.handler.js';
import { MoveProductBatchHandler } from '@/product-batch/commands/handlers/move-product-batch.handler.js';
import { ProductBatchEventStore } from '@/product-batch/prodict-batch.eventstore.js';
import { ProductBatchController } from '@/product-batch/product-batch.controller.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchRepositoryProvider } from '@/product-batch/product-batch.repository.js';
import { ProductBatchResolver } from '@/product-batch/product-batch.resolver.js';
import { GetProductBatchListHandler } from '@/product-batch/queries/handlers/get-product-batch-list.handler.js';
import { ProductBatchGroupModule } from '@/product-batch-group/product-batch-group.module.js';
import { ProductBatchGroupRepositoryProvider } from '@/product-batch-group/product-batch-group.repository.js';
import { StatusModule } from '@/status/status.module.js';

import { ProductBatchService } from './product-batch.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductBatchEntity]),
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
    GetProductBatchListHandler,
    CreateProductBatchHandler,
    MoveProductBatchHandler,
    ProductBatchRepositoryProvider,
  ],
  controllers: [ProductBatchController],
  exports: [ProductBatchService, ProductBatchRepositoryProvider],
})
export class ProductBatchModule {}
