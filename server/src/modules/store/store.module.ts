import { Module } from '@nestjs/common';

import { Microservices } from '@/microservices/microservices.js';
import { ProductModule } from '@/product/product.module.js';
import { ProductBatchModule } from '@/product-batch/product-batch.module.js';
import { StatusModule } from '@/status/status.module.js';
import { StoreResolver } from '@/store/store.resolver.js';

import { StoreService } from './store.service.js';

@Module({
  imports: [Microservices, ProductBatchModule, ProductModule, StatusModule],
  providers: [StoreService, StoreResolver],
  exports: [StoreService],
})
export class StoreModule {}
