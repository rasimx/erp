import { Module } from '@nestjs/common';

import { Microservices } from '@/microservices/microservices.js';
import { ProductBatchModule } from '@/product-batch/product-batch.module.js';
import { StatusModule } from '@/status/status.module.js';

import { OzonService } from './ozon.service.js';

@Module({
  imports: [Microservices, ProductBatchModule, StatusModule],
  providers: [OzonService],
  exports: [OzonService],
})
export class OzonModule {}
