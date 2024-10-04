import type { CreateProductBatchItemDto } from '@/product-batch/dtos/create-product-batch-list.dto.js';

export enum ProductBatchEventType {
  ProductBatchCreated = 'ProductBatchCreated',
  ProductBatchChildCreated = 'ProductBatchChildCreated',
  ProductBatchEdited = 'ProductBatchEdited',
  ProductBatchDeleted = 'ProductBatchDeleted',
  // ProductBatchCreatedFromSource = 'ProductBatchCreatedFromSource',
}

export interface ProductBatchCreatedEventData
  extends CreateProductBatchItemDto {
  statusId: number | null;
  groupId: number | null;
  exchangeRate: number | null;
}
export interface ProductBatchCreatedEvent {
  type: ProductBatchEventType.ProductBatchCreated;
  data: ProductBatchCreatedEventData;
}

export interface ProductBatchChildCreatedEventData {
  id: number;
  productId: number;
  qty: number;
  count: number; // childCount = count * qty
}

export interface ProductBatchChildCreatedEvent {
  type: ProductBatchEventType.ProductBatchChildCreated;
  data: ProductBatchChildCreatedEventData;
}

export interface ProductBatchEditedEventData {
  statusId: number;
}
export interface ProductBatchEditedEvent {
  type: ProductBatchEventType.ProductBatchEdited;
  data: ProductBatchEditedEventData;
}

export interface ProductBatchDeletedEventData {
  id: number;
  count: number;
  userId: number;
}
export interface ProductBatchDeletedEvent {
  type: ProductBatchEventType.ProductBatchDeleted;
  data: ProductBatchDeletedEventData;
}

export type ProductBatchEvent =
  | ProductBatchCreatedEvent
  | ProductBatchChildCreatedEvent
  | ProductBatchEditedEvent
  | ProductBatchDeletedEvent;
