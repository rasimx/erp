import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Microservices } from '@/microservices/microservices.js';
import { ProductModule } from '@/product/product.module.js';
import { ProductBatchController } from '@/product-batch/product-batch.controller.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchResolver } from '@/product-batch/product-batch.resolver.js';
import { StatusModule } from '@/status/status.module.js';

import { ProductBatchService } from './product-batch.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductBatchEntity]),
    Microservices,
    ProductModule,
    StatusModule,
  ],
  providers: [ProductBatchService, ProductBatchResolver],
  controllers: [ProductBatchController],
})
export class ProductBatchModule {}
