import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventStoreModule } from '@/event-store/event-store.module.js';
import { CreateStatusHandler } from '@/status/commands/handlers/create-status.handler.js';
import { MoveStatusHandler } from '@/status/commands/handlers/move-status.handler.js';
import { GetStatusHandler } from '@/status/queries/handlers/get-status.handler.js';
import { GetStatusListHandler } from '@/status/queries/handlers/get-status-list.handler.js';
import { StatusEventStore } from '@/status/status.eventstore.js';
import { StatusRepositoryProvider } from '@/status/status.repository.js';
import { StatusResolver } from '@/status/status.resolver.js';

import { StatusEntity } from './status.entity.js';
import { StatusService } from './status.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([StatusEntity]),
    CqrsModule,
    EventStoreModule,
  ],
  providers: [
    StatusService,
    StatusEventStore,
    StatusResolver,
    GetStatusListHandler,
    GetStatusHandler,
    CreateStatusHandler,
    MoveStatusHandler,
    StatusRepositoryProvider,
  ],
  exports: [StatusService, StatusRepositoryProvider],
})
export class StatusModule {}
