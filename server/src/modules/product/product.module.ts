import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule } from '@/config/app/config.module.js';
import { EventStoreModule } from '@/event-store/event-store.module.js';
import { ProductRepositoryProvider } from '@/product/domain/product.repository.js';
import { ProductEventEntity } from '@/product/domain/product-event.entity.js';
import { ProductEventRepositoryProvider } from '@/product/domain/product-event.repository.js';
import { ProductSetClosureEntity } from '@/product/domain/product-set-closure.entity.js';
import { ProductController } from '@/product/product.controller.js';
import { ProductResolver } from '@/product/product.resolver.js';

import { ProductEntity } from './domain/product.entity.js';
import { ProductService } from './product.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductEventEntity,
      ProductSetClosureEntity,
    ]),
    AppConfigModule,
    EventStoreModule,
  ],
  providers: [
    ProductService,
    ProductResolver,
    ProductRepositoryProvider,
    ProductEventRepositoryProvider,
  ],
  exports: [
    ProductService,
    ProductRepositoryProvider,
    ProductEventRepositoryProvider,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
