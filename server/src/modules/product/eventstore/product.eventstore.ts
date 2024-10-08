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

import {
  type ProductCreatedEvent,
  type ProductCreatedEventData,
  type ProductDeletedEvent,
  productStreamName,
} from './types.js';

@Injectable()
export class ProductEventStore {
  constructor(
    private readonly eventStoreService: EventStoreService,
    private readonly contextService: ContextService,
  ) {}

  async appendEvent(event: EventData<JSONEventType>, id: number) {
    const STREAM_NAME = productStreamName(id);

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

  // async appendProductCreatedEvent({
  //   eventId,
  //   data,
  // }: {
  //   eventId: string;
  //   data: Omit<ProductCreatedEventData, 'userId'>;
  // }): Promise<{ appendResult: AppendResult; cancel: () => Promise<void> }> {
  //   const userId = this.contextService.userId;
  //   const event = jsonEvent<ProductCreatedEvent>({
  //     id: eventId,
  //     type: 'ProductCreated',
  //     data: { ...data, userId },
  //   });
  //
  //   return this.appendEvent(event, data.id);
  // }
  //
  // async appendProductDeletedEvent({
  //   eventId,
  //   id,
  // }: {
  //   eventId: string;
  //   id: number;
  // }) {
  //   const userId = this.contextService.userId;
  //   const event = jsonEvent<ProductDeletedEvent>({
  //     id: eventId,
  //     type: 'ProductDeleted',
  //     data: { id, userId },
  //   });
  //
  //   return this.appendEvent(event, id);
  // }
  //
  // async appendProductBatchCreatedEvent({
  //   eventId,
  //   productId,
  //   data,
  // }: {
  //   eventId: string;
  //   productId: number;
  //   data: Omit<ProductBatchCreatedEventData, 'userId'>;
  // }): Promise<{ appendResult: AppendResult; cancel: () => Promise<void> }> {
  //   const userId = this.contextService.userId;
  //   const event = jsonEvent<ProductBatchCreatedEvent>({
  //     id: eventId,
  //     type: 'ProductBatchCreated',
  //     data: { ...data, userId },
  //   });
  //
  //   return this.appendEvent(event, productId);
  // }
  //
  // async appendProductBatchEditedEvent({
  //   eventId,
  //   productId,
  //   data,
  // }: {
  //   eventId: string;
  //   productId: number;
  //   data: Omit<ProductBatchEditedEventData, 'userId'>;
  // }): Promise<{ appendResult: AppendResult; cancel: () => Promise<void> }> {
  //   const userId = this.contextService.userId;
  //   const event = jsonEvent<ProductBatchEditedEvent>({
  //     id: eventId,
  //     type: 'ProductBatchEdited',
  //     data: { ...data, userId },
  //   });
  //
  //   return this.appendEvent(event, productId);
  // }
  //
  // async appendProductBatchCreatedByAssemblingEvent({
  //   eventId,
  //   productId,
  //   data,
  // }: {
  //   eventId: string;
  //   productId: number;
  //   data: Omit<ProductBatchCreatedByAssemblingEventData, 'userId'>;
  // }): Promise<{ appendResult: AppendResult; cancel: () => Promise<void> }> {
  //   const userId = this.contextService.userId;
  //   const event = jsonEvent<ProductBatchCreatedByAssemblingEvent>({
  //     id: eventId,
  //     type: 'ProductBatchCreatedByAssembling',
  //     data: { ...data, userId },
  //   });
  //
  //   return this.appendEvent(event, productId);
  // }
  //
  // async appendProductBatchDeletedEvent({
  //   eventId,
  //   productId,
  //   data,
  // }: {
  //   eventId: string;
  //   productId: number;
  //   data: Omit<ProductBatchDeletedEventData, 'userId'>;
  // }) {
  //   const userId = this.contextService.userId;
  //   const event = jsonEvent<ProductBatchDeletedEvent>({
  //     id: eventId,
  //     type: 'ProductBatchDeleted',
  //     data: { ...data, userId },
  //   });
  //
  //   return this.appendEvent(event, productId);
  // }

  async getEvents(productBatchId: number) {
    const STREAM_NAME = productStreamName(productBatchId);

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
