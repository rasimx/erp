import type { CreateProductBatchItemDto } from '@/product-batch/dtos/create-product-batch-list.dto.js';

export enum ProductBatchEventType {
  ProductBatchCreated = 'ProductBatchCreated',
  ProductBatchChildCreated = 'ProductBatchChildCreated',
  ProductBatchEdited = 'ProductBatchEdited',
  ProductBatchMoved = 'ProductBatchMoved',
  ProductBatchDeleted = 'ProductBatchDeleted',
  // ProductBatchCreatedFromSource = 'ProductBatchCreatedFromSource',
}

export interface ProductBatchCreatedEventData
  extends CreateProductBatchItemDto {
  order: number;
  statusId: number | null;
  groupId: number | null;
  exchangeRate: number | null;
}
export interface ProductBatchCreatedEvent {
  id: string;
  type: ProductBatchEventType.ProductBatchCreated;
  data: ProductBatchCreatedEventData;
  metadata?: Record<string, unknown>;
}

export interface ProductBatchChildCreatedEventData {
  id: number;
  productId: number;
  qty: number;
  count: number; // childCount = count * qty
}
export interface ProductBatchChildCreatedEvent {
  id: string;
  type: ProductBatchEventType.ProductBatchChildCreated;
  data: ProductBatchChildCreatedEventData;
  metadata?: Record<string, unknown>;
}

export interface ProductBatchMovedEventData {
  order: number;
  groupId?: number | null;
  statusId?: number | null;
}
export interface ProductBatchMovedEvent {
  id: string;
  type: ProductBatchEventType.ProductBatchMoved;
  data: ProductBatchMovedEventData;
  metadata?: Record<string, unknown>;
}

export interface ProductBatchEditedEventData {
  statusId: number;
}
export interface ProductBatchEditedEvent {
  id: string;
  type: ProductBatchEventType.ProductBatchEdited;
  data: ProductBatchEditedEventData;
  metadata?: Record<string, unknown>;
}

export interface ProductBatchDeletedEventData {
  id: number;
  count: number;
  userId: number;
}
export interface ProductBatchDeletedEvent {
  id: string;
  type: ProductBatchEventType.ProductBatchDeleted;
  data: ProductBatchDeletedEventData;
  metadata?: Record<string, unknown>;
}

export type ProductBatchEvent =
  | ProductBatchCreatedEvent
  | ProductBatchChildCreatedEvent
  | ProductBatchEditedEvent
  | ProductBatchMovedEvent
  | ProductBatchDeletedEvent;

export type RevisionProductBatchEvent = ProductBatchEvent & {
  revision: number;
};
