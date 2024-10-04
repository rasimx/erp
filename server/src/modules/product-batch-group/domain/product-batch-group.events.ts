import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';

export enum ProductBatchGroupEventType {
  ProductBatchGroupCreated = 'ProductBatchGroupCreated',
  ProductBatchGroupDeleted = 'ProductBatchGroupDeleted',
  ProductBatchGroupMoved = 'ProductBatchGroupMoved',
}

export interface ProductBatchGroupCreatedEventData
  extends CreateProductBatchGroupDto {
  order: number;
}

export interface ProductBatchGroupCreatedEvent {
  type: ProductBatchGroupEventType.ProductBatchGroupCreated;
  data: ProductBatchGroupCreatedEventData;
}

export interface ProductBatchGroupMovedEventData {
  order: number;
  statusId?: number | null;
}

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

export type RevisionProductBatchGroupEvent = ProductBatchGroupEvent & {
  revision: number;
};
