import {
  BACKWARDS,
  END,
  jsonEvent,
  type JSONEventType,
} from '@eventstore/db-client';
import { Injectable } from '@nestjs/common';

import type { JSONCompatible } from '@/common/helpers/utils.js';
import { EventStoreService } from '@/event-store/event-store.service.js';
import type { CreateOperationDto } from '@/operation/dtos/create-operation.dto.js';

import type { CreateProductBatchGroupDto } from './dtos/create-product-batch-group.dto.js';
import type { MoveProductBatchGroupDto } from './dtos/move-product-batch-group.dto.js';

export type CreateProductBatchGroupEvent = JSONEventType<
  'CreateProductBatchGroup',
  JSONCompatible<CreateProductBatchGroupDto>
>;
export type DeleteProductBatchGroupEvent = JSONEventType<
  'DeleteProductBatchGroup',
  JSONCompatible<{ id: number }>
>;
export type MoveProductBatchGroupEvent = JSONEventType<
  'MoveProductBatchGroup',
  JSONCompatible<MoveProductBatchGroupDto>
>;

export type CreateOperationEvent = JSONEventType<
  'CreateOperation',
  JSONCompatible<CreateOperationDto>
>;

@Injectable()
export class ProductBatchGroupEventStore {
  constructor(private readonly eventStoreService: EventStoreService) {}

  async createProductBatchGroup({
    eventId,
    productBatchGroupId,
    dto,
  }: {
    eventId: string;
    productBatchGroupId: number;
    dto: CreateProductBatchGroupDto;
  }) {
    const event = jsonEvent<CreateProductBatchGroupEvent>({
      id: eventId,
      type: 'CreateProductBatchGroup',
      data: dto,
    });

    const STREAM_NAME = `ProductBatchGroup-${productBatchGroupId.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
  }

  async deleteProductBatchGroup({
    eventId,
    productBatchGroupId,
  }: {
    eventId: string;
    productBatchGroupId: number;
  }) {
    const event = jsonEvent<DeleteProductBatchGroupEvent>({
      id: eventId,
      type: 'DeleteProductBatchGroup',
      data: { id: productBatchGroupId },
    });

    const STREAM_NAME = `ProductBatchGroup-${productBatchGroupId.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
  }
  async moveProductBatchGroup({
    eventId,
    dto,
  }: {
    eventId: string;
    dto: MoveProductBatchGroupDto;
  }) {
    const event = jsonEvent<MoveProductBatchGroupEvent>({
      id: eventId,
      type: 'MoveProductBatchGroup',
      data: dto,
    });

    const STREAM_NAME = `ProductBatchGroup-${dto.id.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
  }

  async createOperation({
    eventId,
    productBatchGroupId,
    dto,
  }: {
    eventId: string;
    productBatchGroupId: number;
    dto: CreateOperationDto;
  }) {
    const event = jsonEvent<CreateOperationEvent>({
      id: eventId,
      type: 'CreateOperation',
      data: dto,
    });

    const STREAM_NAME = `ProductBatchGroup-${productBatchGroupId.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
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
