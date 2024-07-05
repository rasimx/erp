import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventStoreModule } from '@/event-store/event-store.module.js';
import { Microservices } from '@/microservices/microservices.js';
import { ProductModule } from '@/product/product.module.js';
import { ProductBatchEventStore } from '@/product-batch/prodict-batch.eventstore.js';
import { ProductBatchController } from '@/product-batch/product-batch.controller.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchResolver } from '@/product-batch/product-batch.resolver.js';
import { GetProductBatchListHandler } from '@/product-batch/queries/handlers/get-product-batch-list.handler.js';
import { StatusModule } from '@/status/status.module.js';

import { CreateProductBatchGroupHandler } from './commands/handlers/create-product-batch-group.handler.js';
import { MoveProductBatchGroupHandler } from './commands/handlers/move-product-batch-group.handler.js';
import { ProductBatchService } from './product-batch.service.js';
import { ProductBatchGroupRepositoryProvider } from './product-batch-group.repository.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductBatchEntity]),
    Microservices,
    ProductModule,
    StatusModule,
    CqrsModule,
    EventStoreModule,
  ],
  providers: [
    ProductBatchEventStore,
    ProductBatchService,
    ProductBatchResolver,
    GetProductBatchListHandler,
    CreateProductBatchGroupHandler,
    MoveProductBatchGroupHandler,
    ProductBatchGroupRepositoryProvider,
  ],
  controllers: [ProductBatchController],
  exports: [ProductBatchService],
})
export class ProductBatchModule {}
