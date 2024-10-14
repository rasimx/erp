import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule } from '@/config/app/config.module.js';
import { ProductEventEntity } from '@/product/domain/product.event-entity.js';
import { ProductEventRepositoryProvider } from '@/product/domain/product.event-repo.js';
import { ProductRepositoryProvider } from '@/product/domain/product.read-repo.js';
import { ProductSetClosureEntity } from '@/product/domain/product-set-closure.entity.js';
import { ProductController } from '@/product/product.controller.js';
import { ProductResolver } from '@/product/product.resolver.js';
import { GetProductListHandler } from '@/product/queries/get-product-list/get-product-list.handler.js';
import { GetProductSetListHandler } from '@/product/queries/get-product-set-list/get-product-set-list.handler.js';

import { ProductReadEntity } from './domain/product.read-entity.js';
import { ProductService } from './product.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductReadEntity,
      ProductEventEntity,
      ProductSetClosureEntity,
    ]),
    AppConfigModule,
    CqrsModule,
  ],
  providers: [
    ProductService,
    ProductResolver,
    ProductRepositoryProvider,
    ProductEventRepositoryProvider,
    GetProductListHandler,
    GetProductSetListHandler,
  ],
  exports: [
    ProductService,
    ProductRepositoryProvider,
    ProductEventRepositoryProvider,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
