import type { CreateOperationDto } from '../dtos/create-operation.dto.js';
import type { CreateProductBatchItemDto } from '../dtos/create-product-batch-list.dto.js';

export enum ProductBatchEventType {
  ProductBatchCreated = 'ProductBatchCreated',
  ProductBatchChildCreated = 'ProductBatchChildCreated',
  ProductBatchEdited = 'ProductBatchEdited',
  ProductBatchMoved = 'ProductBatchMoved',
  ProductBatchDeleted = 'ProductBatchDeleted',
  OperationCreated = 'OperationCreated',
  GroupOperationCreated = 'GroupOperationCreated',
  // ProductBatchCreatedFromSource = 'ProductBatchCreatedFromSource',
}

export type UID = string;

export interface ProductBatchCreatedEventData
  extends CreateProductBatchItemDto {
  id: number;
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

export interface OperationCreatedEventData extends CreateOperationDto {
  id: number;
}

export interface OperationCreatedEvent {
  id: UID;
  type: ProductBatchEventType.OperationCreated;
  data: OperationCreatedEventData;
  metadata?: Record<string, unknown>;
}
export interface GroupOperationCreatedEventData
  extends OperationCreatedEventData {
  proportion: number;
  groupOperationId: number;
  groupOperationCost: number;
}

export interface GroupOperationCreatedEvent {
  id: UID;
  type: ProductBatchEventType.GroupOperationCreated;
  data: GroupOperationCreatedEventData;
  metadata?: Record<string, unknown>;
}

export type ProductBatchEvent =
  | ProductBatchCreatedEvent
  | ProductBatchChildCreatedEvent
  | ProductBatchEditedEvent
  | ProductBatchMovedEvent
  | ProductBatchDeletedEvent
  | OperationCreatedEvent
  | GroupOperationCreatedEvent;

export type RevisionProductBatchEvent = ProductBatchEvent & {
  revision: number;
};
