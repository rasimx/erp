import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RequestEntity } from '@/request/request.entity.js';
import { RequestRepositoryProvider } from '@/request/request.repository.js';

import { RequestService } from './request.service.js';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([RequestEntity])],
  providers: [RequestRepositoryProvider, RequestService],
  exports: [RequestRepositoryProvider, RequestService],
})
export class RequestModule {}
