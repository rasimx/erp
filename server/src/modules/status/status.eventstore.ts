import { jsonEvent, type JSONEventType } from '@eventstore/db-client';
import { Injectable } from '@nestjs/common';

import type { JSONCompatible } from '@/common/helpers/utils.js';
import { ContextService } from '@/context/context.service.js';
import { EventStoreService } from '@/event-store/event-store.service.js';
import type { CreateStatusDto } from '@/status/dtos/create-status.dto.js';
import type { MoveStatusDto } from '@/status/dtos/move-status.dto.js';

export type CreateStatusEvent = JSONEventType<
  'CreateStatus',
  JSONCompatible<CreateStatusDto>
>;
export type MoveStatusEvent = JSONEventType<
  'MoveStatus',
  JSONCompatible<MoveStatusDto>
>;

export const getStatusStreamName = (userId: number) =>
  `Status_UserId-${userId.toString()}`;

@Injectable()
export class StatusEventStore {
  constructor(
    private readonly eventStoreService: EventStoreService,
    private readonly contextService: ContextService,
  ) {}

  async createStatus(id: number, dto: CreateStatusDto) {
    const event = jsonEvent<CreateStatusEvent>({
      type: 'CreateStatus',
      data: dto,
    });
    const userId = this.contextService.userId;
    await this.eventStoreService.appendToStream(
      getStatusStreamName(userId),
      event,
    );
  }
  async moveStatus(dto: MoveStatusDto) {
    const event = jsonEvent<MoveStatusEvent>({
      type: 'MoveStatus',
      data: dto,
    });

    const userId = this.contextService.userId;
    await this.eventStoreService.appendToStream(
      getStatusStreamName(userId),
      event,
    );
  }
}
