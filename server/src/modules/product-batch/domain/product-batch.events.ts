import type { ProductProps } from '@/product/domain/product.interfaces.js';

import type { AddOperationDto } from '../dtos/add-operation.dto.js';
import type { CreateProductBatchItemDto } from '../dtos/create-product-batch-list.dto.js';

export enum ProductBatchEventType {
  ProductBatchCreated = 'ProductBatchCreated',
  ProductBatchChildCreated = 'ProductBatchChildCreated',
  ProductBatchEdited = 'ProductBatchEdited',
  ProductBatchMoved = 'ProductBatchMoved',
  ProductBatchDeleted = 'ProductBatchDeleted',
  OperationAdded = 'OperationAdded',
  GroupOperationAdded = 'GroupOperationAdded',
}

export type UID = string;

export interface ProductBatchCreatedEventData
  extends CreateProductBatchItemDto {
  id: number;
  productProps: ProductProps;
  initialCount: number;
  order: number;
  statusId: number | null;
  groupId: number | null;
  exchangeRate: number | null;
}
export interface ProductBatchCreatedEvent {
  id: UID;
  type: ProductBatchEventType.ProductBatchCreated;
  data: ProductBatchCreatedEventData;
  metadata?: Record<string, unknown>;
}

export interface ProductBatchChildCreatedEventData {
  childId: number;
  qty: number;
  count: number; // childCount = count * qty
}
export interface ProductBatchChildCreatedEvent {
  id: UID;
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
  id: UID;
  type: ProductBatchEventType.ProductBatchMoved;
  data: ProductBatchMovedEventData;
  metadata?: Record<string, unknown>;
}

export interface ProductBatchEditedEventData {
  statusId: number;
}
export interface ProductBatchEditedEvent {
  id: UID;
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
  id: UID;
  type: ProductBatchEventType.ProductBatchDeleted;
  data: ProductBatchDeletedEventData;
  metadata?: Record<string, unknown>;
}

export interface OperationAddedEventData extends AddOperationDto {
  id: number;
}

export interface OperationAddedEvent {
  id: UID;
  type: ProductBatchEventType.OperationAdded;
  data: OperationAddedEventData;
  metadata?: Record<string, unknown>;
}
export interface GroupOperationAddedEventData extends OperationAddedEventData {
  proportion: number;
  groupOperationId: number;
  groupOperationCost: number;
}

export interface GroupOperationAddedEvent {
  id: UID;
  type: ProductBatchEventType.GroupOperationAdded;
  data: GroupOperationAddedEventData;
  metadata?: Record<string, unknown>;
}

export type ProductBatchEvent =
  | ProductBatchCreatedEvent
  | ProductBatchChildCreatedEvent
  | ProductBatchEditedEvent
  | ProductBatchMovedEvent
  | ProductBatchDeletedEvent
  | OperationAddedEvent
  | GroupOperationAddedEvent;

export type RevisionProductBatchEvent = ProductBatchEvent & {
  revision: number;
};
