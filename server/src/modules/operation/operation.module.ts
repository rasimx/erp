import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OperationResolver } from '@/operation/operation.resolver.js';

import { OperationEntity } from './operation.entity.js';
import { OperationService } from './operation.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([OperationEntity])],
  providers: [OperationService],
  // providers: [OperationService, OperationResolver],
})
export class OperationModule {}
