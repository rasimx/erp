import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule } from '@/config/app/config.module.js';
import { Microservices } from '@/microservices/microservices.js';
import { OperationModule } from '@/operation/operation.module.js';
import { ProductModule } from '@/product/product.module.js';
import { AddOperationHandler } from '@/product-batch/commands/add-operation/add-operation.handler.js';
import { CreateProductBatchHandler } from '@/product-batch/commands/create-product-batch/create-product-batch.handler.js';
import { CreateProductBatchesFromSourcesHandler } from '@/product-batch/commands/create-product-batches-from-sources/create-product-batches-from-sources.handler.js';
import { DeleteProductBatchHandler } from '@/product-batch/commands/delete-product-batch/delete-product-batch.handler.js';
import { EditProductBatchHandler } from '@/product-batch/commands/edit-product-batch/edit-product-batch.handler.js';
import { MoveProductBatchHandler } from '@/product-batch/commands/move-product-batch/move-product-batch.handler.js';
import { ProductBatchEventEntity } from '@/product-batch/domain/product-batch.event-entity.js';
import { ProductBatchEventRepositoryProvider } from '@/product-batch/domain/product-batch.event-repo.js';
import { ProductBatchReadEntity } from '@/product-batch/domain/product-batch.read-entity.js';
import { ProductBatchRepositoryProvider } from '@/product-batch/domain/product-batch.read-repo.js';
import { ProductBatchController } from '@/product-batch/product-batch.controller.js';
import { ProductBatchResolver } from '@/product-batch/product-batch.resolver.js';
import { GetProductBatchHandler } from '@/product-batch/queries/get-product-batch/get-product-batch.handler.js';
import { GetProductBatchListHandler } from '@/product-batch/queries/get-product-batch-list/get-product-batch-list.handler.js';
import { ProductBatchGroupModule } from '@/product-batch-group/product-batch-group.module.js';
import { RequestModule } from '@/request/request.module.js';
import { StatusModule } from '@/status/status.module.js';

import { ProductBatchService } from './product-batch.service.js';

const commandHandlers = [
  MoveProductBatchHandler,
  DeleteProductBatchHandler,
  CreateProductBatchHandler,
  EditProductBatchHandler,
  CreateProductBatchesFromSourcesHandler,
  AddOperationHandler,
];

const queryHandlers = [GetProductBatchHandler, GetProductBatchListHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductBatchReadEntity, ProductBatchEventEntity]),
    AppConfigModule,
    Microservices,
    ProductModule,
    ProductBatchGroupModule,
    StatusModule,
    CqrsModule,
    forwardRef(() => OperationModule),
  ],
  providers: [
    ProductBatchService,
    ProductBatchResolver,
    ProductBatchRepositoryProvider,
    ProductBatchEventRepositoryProvider,
    RequestModule,
    ...commandHandlers,
    ...queryHandlers,
  ],
  controllers: [ProductBatchController],
  exports: [
    ProductBatchService,
    ProductBatchRepositoryProvider,
    ProductBatchEventRepositoryProvider,
  ],
})
export class ProductBatchModule {}
