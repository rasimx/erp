import { jsonEvent, type JSONEventType } from '@eventstore/db-client';
import { Injectable } from '@nestjs/common';

import type { JSONCompatible } from '@/common/helpers/utils.js';
import { EventStoreService } from '@/event-store/event-store.service.js';
import type { CreateProductBatchGroupDto } from '@/product-batch/dtos/create-product-batch-group.dto.js';
import type { MoveProductBatchGroupDto } from '@/product-batch/dtos/move-product-batch-group.dto.js';
import type { MoveProductBatchItemsDto } from '@/product-batch/dtos/move-product-batch-items.dto.js';

export type CreateProductBatchEvent = JSONEventType<
  'CreateProductBatch',
  JSONCompatible<CreateProductBatchGroupDto>
>;
export type MoveProductBatchEvent = JSONEventType<
  'MoveProductBatch',
  JSONCompatible<MoveProductBatchGroupDto>
>;

export type MoveProductBatchItemsEvent = JSONEventType<
  'MoveProductBatchItems',
  JSONCompatible<MoveProductBatchItemsDto>
>;

@Injectable()
export class ProductBatchEventStore {
  constructor(private readonly eventStoreService: EventStoreService) {}

  async createProductBatch(id: number, dto: CreateProductBatchGroupDto) {
    const event = jsonEvent<CreateProductBatchEvent>({
      type: 'CreateProductBatch',
      data: dto,
    });

    const STREAM_NAME = `ProductBatch-${id.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
  }
  async moveProductBatch(dto: MoveProductBatchGroupDto) {
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
