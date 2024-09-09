import {
  BACKWARDS,
  END,
  jsonEvent,
  type JSONEventType,
} from '@eventstore/db-client';
import { Injectable } from '@nestjs/common';

import { EventStoreService } from '@/event-store/event-store.service.js';
import type { CreateOperationDto } from '@/operation/dtos/create-operation.dto.js';
import type { OperationCreatedEvent } from '@/product-batch/eventstore/types.js';
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
  constructor(private readonly eventStoreService: EventStoreService) {}

  async appendProductBatchGroupCreatedEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: ProductBatchGroupCreatedEventData;
  }) {
    const event = jsonEvent<ProductBatchGroupCreatedEvent>({
      id: eventId,
      type: 'ProductBatchGroupCreated',
      data,
    });

    const STREAM_NAME = productBatchGroupStreamName(data.id);

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

  async appendProductBatchGroupDeletedEvent({
    eventId,
    productBatchGroupId,
  }: {
    eventId: string;
    productBatchGroupId: number;
  }) {
    const event = jsonEvent<ProductBatchGroupDeletedEvent>({
      id: eventId,
      type: 'ProductBatchGroupDeleted',
      data: { id: productBatchGroupId },
    });

    const STREAM_NAME = `ProductBatchGroup-${productBatchGroupId.toString()}`;

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

  async appendProductBatchGroupMovedEvent({
    eventId,
    dto,
  }: {
    eventId: string;
    dto: MoveProductBatchGroupDto;
  }) {
    const event = jsonEvent<ProductBatchGroupMovedEvent>({
      id: eventId,
      type: 'ProductBatchGroupMoved',
      data: dto,
    });

    const STREAM_NAME = `ProductBatchGroup-${dto.id.toString()}`;

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

  async appendOperationCreatedEvent({
    eventId,
    productBatchGroupId,
    dto,
  }: {
    eventId: string;
    productBatchGroupId: number;
    dto: CreateOperationDto;
  }) {
    const event = jsonEvent<OperationCreatedEvent>({
      id: eventId,
      type: 'CreateOperation',
      data: dto,
    });

    const STREAM_NAME = `ProductBatchGroup-${productBatchGroupId.toString()}`;

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

  async getEvents(productBatchGroupId: number) {
    const STREAM_NAME = `ProductBatchGroup-${productBatchGroupId.toString()}`;

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
