import {
  BACKWARDS,
  END,
  FORWARDS,
  jsonEvent,
  type JSONEventType,
  type ResolvedEvent,
  START,
} from '@eventstore/db-client';
import { Injectable } from '@nestjs/common';

import type { JSONCompatible } from '@/common/helpers/utils.js';
import { EventStoreService } from '@/event-store/event-store.service.js';
import type { CreateOperationDto } from '@/operation/dtos/create-operation.dto.js';
import type { CreateProductBatchDto } from '@/product-batch/dtos/create-product-batch.dto.js';
import type { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';
import type { MoveProductBatchItemsDto } from '@/product-batch/dtos/move-product-batch-items.dto.js';

export type CreateProductBatchEvent = JSONEventType<
  'CreateProductBatch',
  JSONCompatible<CreateProductBatchDto>
>;
export type DeleteProductBatchEvent = JSONEventType<
  'DeleteProductBatch',
  JSONCompatible<{ id: number }>
>;
export type MoveProductBatchEvent = JSONEventType<
  'MoveProductBatch',
  JSONCompatible<MoveProductBatchDto>
>;

export type MoveProductBatchItemsEvent = JSONEventType<
  'MoveProductBatchItems',
  JSONCompatible<MoveProductBatchItemsDto>
>;

export type CreateOperationEvent = JSONEventType<
  'CreateOperation',
  JSONCompatible<CreateOperationDto>
>;

@Injectable()
export class ProductBatchEventStore {
  constructor(private readonly eventStoreService: EventStoreService) {}

  async createProductBatch({
    eventId,
    productBatchId,
    dto,
  }: {
    eventId: string;
    productBatchId: number;
    dto: CreateProductBatchDto;
  }) {
    const event = jsonEvent<CreateProductBatchEvent>({
      id: eventId,
      type: 'CreateProductBatch',
      data: dto,
    });

    const STREAM_NAME = `ProductBatch-${productBatchId.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
  }
  async deleteProductBatch({
    eventId,
    productBatchId,
  }: {
    eventId: string;
    productBatchId: number;
  }) {
    const event = jsonEvent<DeleteProductBatchEvent>({
      id: eventId,
      type: 'DeleteProductBatch',
      data: { id: productBatchId },
    });

    const STREAM_NAME = `ProductBatch-${productBatchId.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
  }
  async moveProductBatch({
    eventId,
    dto,
  }: {
    eventId: string;
    dto: MoveProductBatchDto;
  }) {
    const event = jsonEvent<MoveProductBatchEvent>({
      id: eventId,
      type: 'MoveProductBatch',
      data: dto,
    });

    const STREAM_NAME = `ProductBatch-${dto.id.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
  }
  async moveProductBatchItems({
    eventId,
    dto,
  }: {
    eventId: string;
    dto: MoveProductBatchItemsDto;
  }) {
    const event = jsonEvent<MoveProductBatchItemsEvent>({
      id: eventId,
      type: 'MoveProductBatchItems',
      data: dto,
    });

    const STREAM_NAME = `ProductBatch-${dto.donorId.toString()}`;

    const a = await this.eventStoreService.appendToStream(STREAM_NAME, event);
  }

  async createOperation({
    eventId,
    productBatchId,
    dto,
  }: {
    eventId: string;
    productBatchId: number;
    dto: CreateOperationDto;
  }) {
    const event = jsonEvent<CreateOperationEvent>({
      id: eventId,
      type: 'CreateOperation',
      data: dto,
    });

    const STREAM_NAME = `ProductBatch-${productBatchId.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
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

/*
 * события
 * - партия
 *  - добавление
 *  - перенос
 *  - редактирование
 *  - удаление
 *  - перенос части товаров в другую партию
 *  - добавление в группу
 *  - удаление из группы
 *  - добавление операции
 *  - удаление операции
 *  - редактирование операции
 * - группа
 *  - добавление группы
 *  - перенос
 *  - редактирование группы
 *  - удаление группы
 *  - добавление операции
 *  - удаление операции
 *  - редактирование операции
 * */
