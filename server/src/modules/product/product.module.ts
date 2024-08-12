import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule } from '@/config/app/config.module.js';
import { ProductController } from '@/product/product.controller.js';
import { ProductResolver } from '@/product/product.resolver.js';

import { ProductEntity } from './product.entity.js';
import { ProductService } from './product.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), AppConfigModule],
  providers: [ProductService, ProductResolver],
  exports: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
