import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule } from '@/config/app/config.module.js';
import { ProductController } from '@/product/product.controller.js';
import { ProductResolver } from '@/product/product.resolver.js';
import { ProductSetClosureEntity } from '@/product/product-set-closure.entity.js';

import { ProductEntity } from './product.entity.js';
import { ProductService } from './product.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, ProductSetClosureEntity]),
    AppConfigModule,
  ],
  providers: [ProductService, ProductResolver],
  exports: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
