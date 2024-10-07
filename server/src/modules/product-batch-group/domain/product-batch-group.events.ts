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
  id: string;
  type: ProductBatchGroupEventType.ProductBatchGroupCreated;
  data: ProductBatchGroupCreatedEventData;
  metadata?: Record<string, unknown>;
}

export interface ProductBatchGroupMovedEventData {
  order: number;
  statusId?: number | null;
}

export interface ProductBatchGroupMovedEvent {
  id: string;
  type: ProductBatchGroupEventType.ProductBatchGroupMoved;
  data: ProductBatchGroupMovedEventData;
  metadata?: Record<string, unknown>;
}

export interface ProductBatchGroupDeletedEvent {
  id: string;
  type: ProductBatchGroupEventType.ProductBatchGroupDeleted;
  data: null;
  metadata?: Record<string, unknown>;
}

export type ProductBatchGroupEvent =
  | ProductBatchGroupCreatedEvent
  | ProductBatchGroupMovedEvent
  | ProductBatchGroupDeletedEvent;

export type RevisionProductBatchGroupEvent = ProductBatchGroupEvent & {
  revision: number;
};
