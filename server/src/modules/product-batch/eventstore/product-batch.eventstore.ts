import {
  BACKWARDS,
  END,
  jsonEvent,
  type JSONEventType,
} from '@eventstore/db-client';
import type { AppendResult } from '@eventstore/db-client/dist/types/index.js';
import { Injectable } from '@nestjs/common';

import { EventStoreService } from '@/event-store/event-store.service.js';
import type { CreateOperationDto } from '@/operation/dtos/create-operation.dto.js';
import type { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';
import type { MoveProductBatchItemsDto } from '@/product-batch/dtos/move-product-batch-items.dto.js';
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
  type ProductBatchItemsMovedEvent,
  type ProductBatchMovedEvent,
  productBatchStreamName,
} from '@/product-batch/eventstore/types.js';

@Injectable()
export class ProductBatchEventStore {
  constructor(private readonly eventStoreService: EventStoreService) {}

  async appendProductBatchCreatedEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: ProductBatchCreatedEventData;
  }): Promise<{ appendResult: AppendResult; cancel: () => Promise<void> }> {
    const event = jsonEvent<ProductBatchCreatedEvent>({
      id: eventId,
      type: 'ProductBatchCreated',
      data: data,
    });

    const STREAM_NAME = productBatchStreamName(data.id);

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

  async appendProductBatchCreatedFromSourceEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: ProductBatchCreatedFromSourceEventData;
  }): Promise<{ appendResult: AppendResult; cancel: () => Promise<void> }> {
    const event = jsonEvent<ProductBatchCreatedFromSourceEvent>({
      id: eventId,
      type: 'ProductBatchCreatedFromSource',
      data: data,
    });

    const STREAM_NAME = productBatchStreamName(data.id);

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

  async appendProductBatchCreatedByAssemblingEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: ProductBatchCreatedByAssemblingEventData;
  }): Promise<{ appendResult: AppendResult; cancel: () => Promise<void> }> {
    const event = jsonEvent<ProductBatchCreatedByAssemblingEvent>({
      id: eventId,
      type: 'ProductBatchCreatedByAssembling',
      data: data,
    });

    const STREAM_NAME = productBatchStreamName(data.id);

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

  async appendMoveProductsToChildBatchEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: MoveProductsToChildBatchEventData;
  }): Promise<{ appendResult: AppendResult; cancel: () => Promise<void> }> {
    const event = jsonEvent<MoveProductsToChildBatchEvent>({
      id: eventId,
      type: 'MoveProductsToChildBatch',
      data: data,
    });

    const STREAM_NAME = productBatchStreamName(data.id);

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

  async appendProductBatchDeletedEvent({
    eventId,
    productBatchId,
  }: {
    eventId: string;
    productBatchId: number;
  }) {
    const event = jsonEvent<ProductBatchDeletedEvent>({
      id: eventId,
      type: 'ProductBatchDeleted',
      data: { id: productBatchId },
    });

    const STREAM_NAME = productBatchStreamName(productBatchId);

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

  async appendProductBatchMovedEvent({
    eventId,
    data,
  }: {
    eventId: string;
    data: MoveProductBatchDto;
  }) {
    const event = jsonEvent<ProductBatchMovedEvent>({
      id: eventId,
      type: 'ProductBatchMoved',
      data: data,
    });

    const STREAM_NAME = productBatchStreamName(data.id);

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
    productBatchId,
    data,
  }: {
    eventId: string;
    productBatchId: number;
    data: CreateOperationDto;
  }) {
    const event = jsonEvent<OperationCreatedEvent>({
      id: eventId,
      type: 'OperationCreated',
      data: data,
    });

    const STREAM_NAME = productBatchStreamName(productBatchId);

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

  async appendGroupOperationCreatedEvent({
    eventId,
    productBatchId,
    data,
  }: {
    eventId: string;
    productBatchId: number;
    data: CreateOperationDto;
  }) {
    const event = jsonEvent<GroupOperationCreatedEvent>({
      id: eventId,
      type: 'GroupOperationCreated',
      data: data,
    });

    const STREAM_NAME = productBatchStreamName(productBatchId);

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

  async getEvents(productBatchId: number) {
    const STREAM_NAME = `ProductBatch-${productBatchId.toString()}`;

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
