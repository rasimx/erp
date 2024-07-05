import { jsonEvent, type JSONEventType } from '@eventstore/db-client';
import { Injectable } from '@nestjs/common';

import type { JSONCompatible } from '@/common/helpers/utils.js';
import { EventStoreService } from '@/event-store/event-store.service.js';
import type { CreateProductBatchDto } from '@/product-batch/dtos/create-product-batch.dto.js';
import type { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';
import type { MoveProductBatchItemsDto } from '@/product-batch/dtos/move-product-batch-items.dto.js';

export type CreateProductBatchEvent = JSONEventType<
  'CreateProductBatch',
  JSONCompatible<CreateProductBatchDto>
>;
export type MoveProductBatchEvent = JSONEventType<
  'MoveProductBatch',
  JSONCompatible<MoveProductBatchDto>
>;

export type MoveProductBatchItemsEvent = JSONEventType<
  'MoveProductBatchItems',
  JSONCompatible<MoveProductBatchItemsDto>
>;

@Injectable()
export class ProductBatchEventStore {
  constructor(private readonly eventStoreService: EventStoreService) {}

  async createProductBatch(id: number, dto: CreateProductBatchDto) {
    const event = jsonEvent<CreateProductBatchEvent>({
      type: 'CreateProductBatch',
      data: dto,
    });

    const STREAM_NAME = `ProductBatch-${id.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
  }
  async moveProductBatch(dto: MoveProductBatchDto) {
    const event = jsonEvent<MoveProductBatchEvent>({
      type: 'MoveProductBatch',
      data: dto,
    });

    const STREAM_NAME = `ProductBatch-${dto.id.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
  }
  async moveProductBatchItems(dto: MoveProductBatchItemsDto) {
    const event = jsonEvent<MoveProductBatchItemsEvent>({
      type: 'MoveProductBatchItems',
      data: dto,
    });

    const STREAM_NAME = `ProductBatch-${dto.donorId.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
    await this.eventStoreService.appendToStream(STREAM_NAME, event);
  }
}
