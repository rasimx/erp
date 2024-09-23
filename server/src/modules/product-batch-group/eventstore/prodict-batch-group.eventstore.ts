import {
  BACKWARDS,
  END,
  jsonEvent,
  type JSONEventType,
} from '@eventstore/db-client';
import type { EventData } from '@eventstore/db-client/dist/types/index.js';
import { Injectable } from '@nestjs/common';

import { ContextService } from '@/context/context.service.js';
import { EventStoreService } from '@/event-store/event-store.service.js';
import type { CreateOperationDto } from '@/operation/dtos/create-operation.dto.js';
import { type OperationCreatedEvent } from '@/product-batch/eventstore/events.js';
import {
  type ProductBatchGroupCreatedEvent,
  type ProductBatchGroupCreatedEventData,
  type ProductBatchGroupDeletedEvent,
  type ProductBatchGroupMovedEvent,
  productBatchGroupStreamName,
} from '@/product-batch-group/eventstore/types.js';

import type { MoveProductBatchGroupDto } from '../dtos/move-product-batch-group.dto.js';

@Injectable()
export class ProductBatchGroupEventStore {
  constructor(
    private readonly eventStoreService: EventStoreService,
    private readonly contextService: ContextService,
  ) {}

  async appendEvent(event: EventData<JSONEventType>, id: number) {
    const STREAM_NAME = productBatchGroupStreamName(id);

    const appendResult = await this.eventStoreService.appendToStream(
      STREAM_NAME,
      event,
    );

    return {
      appendResult,
      cancel: () =>
        this.eventStoreService.appendTransactionCompensatingEvent(
          STREAM_NAME,
          event,
        ),
    };
  }

  async appendProductBatchGroupCreatedEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: Omit<ProductBatchGroupCreatedEventData, 'userId'>;
  }) {
    const userId = this.contextService.userId;
    const event = jsonEvent<ProductBatchGroupCreatedEvent>({
      id: eventId,
      type: 'ProductBatchGroupCreated',
      data: { ...data, userId },
    });

    return this.appendEvent(event, data.id);
  }

  async appendProductBatchGroupDeletedEvent({
    eventId,
    id,
  }: {
    eventId: string;
    id: number;
  }) {
    const userId = this.contextService.userId;
    const event = jsonEvent<ProductBatchGroupDeletedEvent>({
      id: eventId,
      type: 'ProductBatchGroupDeleted',
      data: { id: id, userId },
    });

    return this.appendEvent(event, id);
  }

  async appendProductBatchGroupMovedEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: MoveProductBatchGroupDto;
  }) {
    const userId = this.contextService.userId;
    const event = jsonEvent<ProductBatchGroupMovedEvent>({
      id: eventId,
      type: 'ProductBatchGroupMoved',
      data: { ...data, userId },
    });

    return this.appendEvent(event, data.id);
  }

  async appendOperationCreatedEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: CreateOperationDto;
  }) {
    if (!data.groupId) throw new Error('groupId is required');

    const userId = this.contextService.userId;
    const event = jsonEvent<OperationCreatedEvent>({
      id: eventId,
      type: 'OperationCreated',
      data: { ...data, userId },
    });

    return this.appendEvent(event, data.groupId);
  }

  async getEvents(id: number) {
    const STREAM_NAME = productBatchGroupStreamName(id);

    const events: JSONEventType[] = [];
    const result = this.eventStoreService.readStream(STREAM_NAME, {
      direction: BACKWARDS,
      fromRevision: END,
      maxCount: 100,
    });

    for await (const event of result) {
      events.push(event.event as JSONEventType);
    }
    return events;
  }
}
