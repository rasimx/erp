import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';
import type { MoveProductBatchGroupDto } from '@/product-batch-group/dtos/move-product-batch-group.dto.js';

export enum ProductBatchGroupEventType {
  ProductBatchGroupCreated = 'ProductBatchGroupCreated',
  ProductBatchGroupDeleted = 'ProductBatchGroupDeleted',
  ProductBatchGroupMoved = 'ProductBatchGroupMoved',
}

export type ProductBatchGroupCreatedEventData = CreateProductBatchGroupDto;

export interface ProductBatchGroupCreatedEvent {
  type: ProductBatchGroupEventType.ProductBatchGroupCreated;
  data: ProductBatchGroupCreatedEventData;
}

export type ProductBatchGroupMovedEventData = MoveProductBatchGroupDto;
export interface ProductBatchGroupMovedEvent {
  type: ProductBatchGroupEventType.ProductBatchGroupMoved;
  data: ProductBatchGroupMovedEventData;
}

export interface ProductBatchGroupDeletedEvent {
  type: ProductBatchGroupEventType.ProductBatchGroupDeleted;
  data: null;
}

export type ProductBatchGroupEvent =
  | ProductBatchGroupCreatedEvent
  | ProductBatchGroupMovedEvent
  | ProductBatchGroupDeletedEvent;
