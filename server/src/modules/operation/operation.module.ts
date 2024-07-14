import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateOperationHandler } from '@/operation/commands/handlers/create-operation.handler.js';
import { OperationResolver } from '@/operation/operation.resolver.js';

import { OperationEntity } from './operation.entity.js';
import { OperationService } from './operation.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([OperationEntity]), CqrsModule],
  providers: [OperationService, CreateOperationHandler, OperationResolver],
})
export class OperationModule {}
