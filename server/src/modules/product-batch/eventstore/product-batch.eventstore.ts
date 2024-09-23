import {
  BACKWARDS,
  END,
  jsonEvent,
  type JSONEventType,
} from '@eventstore/db-client';
import type {
  AppendResult,
  EventData,
} from '@eventstore/db-client/dist/types/index.js';
import { Injectable } from '@nestjs/common';

import { ContextService } from '@/context/context.service.js';
import { EventStoreService } from '@/event-store/event-store.service.js';
import type { CreateOperationDto } from '@/operation/dtos/create-operation.dto.js';
import type { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';
import {
  type GroupOperationCreatedEvent,
  type MoveProductsToChildBatchEvent,
  type MoveProductsToChildBatchEventData,
  type OperationCreatedEvent,
  type ProductBatchCreatedByAssemblingEvent,
  type ProductBatchCreatedByAssemblingEventData,
  type ProductBatchCreatedEvent,
  type ProductBatchCreatedEventData,
  type ProductBatchCreatedFromSourceEvent,
  type ProductBatchCreatedFromSourceEventData,
  type ProductBatchDeletedEvent,
  type ProductBatchDeletedEventData,
  type ProductBatchEditedEvent,
  type ProductBatchEditedEventData,
  type ProductBatchMovedEvent,
  productBatchStreamName,
} from '@/product-batch/eventstore/events.js';

@Injectable()
export class ProductBatchEventStore {
  constructor(
    private readonly eventStoreService: EventStoreService,
    private readonly contextService: ContextService,
  ) {}

  async appendEvent(event: EventData<JSONEventType>, id: number) {
    const STREAM_NAME = productBatchStreamName(id);

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

  async appendProductBatchCreatedEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: Omit<ProductBatchCreatedEventData, 'userId'>;
  }): Promise<{ appendResult: AppendResult; cancel: () => Promise<void> }> {
    const userId = this.contextService.userId;
    const event = jsonEvent<ProductBatchCreatedEvent>({
      id: eventId,
      type: 'ProductBatchCreated',
      data: { ...data, userId },
    });

    return this.appendEvent(event, data.id);
  }

  async appendProductBatchEditedEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: Omit<ProductBatchEditedEventData, 'userId'>;
  }): Promise<{ appendResult: AppendResult; cancel: () => Promise<void> }> {
    const userId = this.contextService.userId;
    const event = jsonEvent<ProductBatchEditedEvent>({
      id: eventId,
      type: 'ProductBatchEdited',
      data: { ...data, userId },
    });

    return this.appendEvent(event, data.id);
  }

  async appendProductBatchCreatedFromSourceEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: Omit<ProductBatchCreatedFromSourceEventData, 'userId'>;
  }): Promise<{ appendResult: AppendResult; cancel: () => Promise<void> }> {
    const userId = this.contextService.userId;
    const event = jsonEvent<ProductBatchCreatedFromSourceEvent>({
      id: eventId,
      type: 'ProductBatchCreatedFromSource',
      data: { ...data, userId },
    });
    return this.appendEvent(event, data.id);
  }

  async appendProductBatchCreatedByAssemblingEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: Omit<ProductBatchCreatedByAssemblingEventData, 'userId'>;
  }): Promise<{ appendResult: AppendResult; cancel: () => Promise<void> }> {
    const userId = this.contextService.userId;
    const event = jsonEvent<ProductBatchCreatedByAssemblingEvent>({
      id: eventId,
      type: 'ProductBatchCreatedByAssembling',
      data: { ...data, userId },
    });

    return this.appendEvent(event, data.id);
  }

  async appendMoveProductsToChildBatchEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: Omit<MoveProductsToChildBatchEventData, 'userId'>;
  }): Promise<{ appendResult: AppendResult; cancel: () => Promise<void> }> {
    const userId = this.contextService.userId;
    const event = jsonEvent<MoveProductsToChildBatchEvent>({
      id: eventId,
      type: 'MoveProductsToChildBatch',
      data: { ...data, userId },
    });

    return this.appendEvent(event, data.id);
  }

  async appendProductBatchDeletedEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: Omit<ProductBatchDeletedEventData, 'userId'>;
  }) {
    const userId = this.contextService.userId;
    const event = jsonEvent<ProductBatchDeletedEvent>({
      id: eventId,
      type: 'ProductBatchDeleted',
      data: { ...data, userId },
    });

    return this.appendEvent(event, data.id);
  }

  async appendProductBatchMovedEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: MoveProductBatchDto;
  }) {
    const userId = this.contextService.userId;
    const event = jsonEvent<ProductBatchMovedEvent>({
      id: eventId,
      type: 'ProductBatchMoved',
      data: { ...data, userId },
    });
    return this.appendEvent(event, data.id);
  }

  async appendOperationCreatedEvent({
    eventId,
    productBatchId,
    data,
  }: {
    eventId: string;
    productBatchId: number;
    data: CreateOperationDto;
  }) {
    const userId = this.contextService.userId;
    const event = jsonEvent<OperationCreatedEvent>({
      id: eventId,
      type: 'OperationCreated',
      data: { ...data, userId },
    });

    return this.appendEvent(event, productBatchId);
  }

  async appendGroupOperationCreatedEvent({
    eventId,
    productBatchId,
    data,
  }: {
    eventId: string;
    productBatchId: number;
    data: CreateOperationDto;
  }) {
    const userId = this.contextService.userId;
    const event = jsonEvent<GroupOperationCreatedEvent>({
      id: eventId,
      type: 'GroupOperationCreated',
      data: { ...data, userId },
    });

    return this.appendEvent(event, productBatchId);
  }

  async getEvents(productBatchId: number) {
    const STREAM_NAME = productBatchStreamName(productBatchId);

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
