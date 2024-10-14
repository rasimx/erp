import { forwardRef, Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule } from '@/config/app/config.module.js';
import { ProductModule } from '@/product/product.module.js';
import { ProductBatchModule } from '@/product-batch/product-batch.module.js';
import { RevertHandler } from '@/request/commands/revert/revert.handler.js';
import { RollbackHandler } from '@/request/commands/rollback/rollback.handler.js';
import { RequestEntity } from '@/request/request.entity.js';
import { RequestRepositoryProvider } from '@/request/request.repository.js';
import { RequestResolver } from '@/request/request.resolver.js';

import { RequestService } from './request.service.js';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([RequestEntity]),
    AppConfigModule,
    CqrsModule,
    forwardRef(() => ProductBatchModule),
    forwardRef(() => ProductModule),
  ],
  providers: [
    RequestRepositoryProvider,
    RequestService,
    RequestResolver,
    RollbackHandler,
    RevertHandler,
  ],
  exports: [RequestRepositoryProvider, RequestService],
})
export class RequestModule {}
