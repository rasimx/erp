import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule } from '@/config/app/config.module.js';
import { CreateStatusHandler } from '@/status/commands/create-status/create-status.handler.js';
import { MoveStatusHandler } from '@/status/commands/move-status/move-status.handler.js';
import { StatusEventEntity } from '@/status/domain/status.event-entity.js';
import { StatusEventRepositoryProvider } from '@/status/domain/status.event-repo.js';
import { StatusRepositoryProvider } from '@/status/domain/status.read-repo.js';
import { GetStatusHandler } from '@/status/queries/get-status/get-status.handler.js';
import { GetStatusListHandler } from '@/status/queries/get-status-list/get-status-list.handler.js';
import { StatusResolver } from '@/status/status.resolver.js';

import { StatusReadEntity } from './domain/status.read-entity.js';
import { StatusService } from './status.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([StatusReadEntity, StatusEventEntity]),
    AppConfigModule,
    CqrsModule,
  ],
  providers: [
    StatusService,
    StatusResolver,
    GetStatusListHandler,
    GetStatusHandler,
    CreateStatusHandler,
    MoveStatusHandler,
    StatusRepositoryProvider,
    StatusEventRepositoryProvider,
  ],
  exports: [
    StatusService,
    StatusRepositoryProvider,
    StatusEventRepositoryProvider,
  ],
})
export class StatusModule {}
