import { jsonEvent, type JSONEventType } from '@eventstore/db-client';
import { Injectable } from '@nestjs/common';

import type { JSONCompatible } from '@/common/helpers/utils.js';
import { EventStoreService } from '@/event-store/event-store.service.js';

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

@Injectable()
export class ProductBatchGroupEventStore {
  constructor(private readonly eventStoreService: EventStoreService) {}

  async createProductBatchGroup(id: number, dto: CreateProductBatchGroupDto) {
    const event = jsonEvent<CreateProductBatchGroupEvent>({
      type: 'CreateProductBatchGroup',
      data: dto,
    });

    const STREAM_NAME = `ProductBatchGroup-${id.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
  }
  async deleteProductBatchGroup(id: number) {
    const event = jsonEvent<DeleteProductBatchGroupEvent>({
      type: 'DeleteProductBatchGroup',
      data: { id },
    });

    const STREAM_NAME = `ProductBatchGroup-${id.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
  }
  async moveProductBatchGroup(dto: MoveProductBatchGroupDto) {
    const event = jsonEvent<MoveProductBatchGroupEvent>({
      type: 'MoveProductBatchGroup',
      data: dto,
    });

    const STREAM_NAME = `ProductBatchGroup-${dto.id.toString()}`;

    await this.eventStoreService.appendToStream(STREAM_NAME, event);
  }
}
