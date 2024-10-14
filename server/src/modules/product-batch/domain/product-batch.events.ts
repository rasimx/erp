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
  Rollback = 'Rollback',
}

export type UID = string;

export interface BaseEvent {
  id: UID;
  revision: number;
  metadata: Record<string, unknown> | null;
  rollbackTargetId?: string | null;
}

export interface ProductBatchCreatedEventData
  extends CreateProductBatchItemDto {
  id: number;
  initialCount: number;
  order: number;
  statusId: number | null;
  groupId: number | null;
  exchangeRate: number | null;
  weight: number;
  volume: number;
}
export interface ProductBatchCreatedEvent extends BaseEvent {
  type: ProductBatchEventType.ProductBatchCreated;
  data: ProductBatchCreatedEventData;
}

export interface ProductBatchChildCreatedEventData {
  childId: number;
  qty: number;
  count: number; // childCount = count * qty
}
export interface ProductBatchChildCreatedEvent extends BaseEvent {
  type: ProductBatchEventType.ProductBatchChildCreated;
  data: ProductBatchChildCreatedEventData;
}

export interface ProductBatchMovedEventData {
  order: number;
  groupId?: number | null;
  statusId?: number | null;
}
export interface ProductBatchMovedEvent extends BaseEvent {
  type: ProductBatchEventType.ProductBatchMoved;
  data: ProductBatchMovedEventData;
}

export interface ProductBatchEditedEventData {
  statusId: number;
}
export interface ProductBatchEditedEvent extends BaseEvent {
  type: ProductBatchEventType.ProductBatchEdited;
  data: ProductBatchEditedEventData;
}

export interface ProductBatchDeletedEventData {
  id: number;
  count: number;
  userId: number;
}
export interface ProductBatchDeletedEvent extends BaseEvent {
  type: ProductBatchEventType.ProductBatchDeleted;
  data: ProductBatchDeletedEventData;
}

export interface OperationAddedEventData extends AddOperationDto {
  id: number;
}

export interface OperationAddedEvent extends BaseEvent {
  type: ProductBatchEventType.OperationAdded;
  data: OperationAddedEventData;
}
export interface GroupOperationAddedEventData extends OperationAddedEventData {
  proportion: number;
  groupOperationId: number;
  groupOperationCost: number;
}

export interface GroupOperationAddedEvent extends BaseEvent {
  type: ProductBatchEventType.GroupOperationAdded;
  data: GroupOperationAddedEventData;
  metadata: Record<string, unknown>;
}

export interface RollbackEvent extends BaseEvent {
  type: ProductBatchEventType.Rollback;
  data: unknown;
  rollbackTargetId: string;
}

export type ProductBatchEvent =
  | ProductBatchCreatedEvent
  | ProductBatchChildCreatedEvent
  | ProductBatchEditedEvent
  | ProductBatchMovedEvent
  | ProductBatchDeletedEvent
  | OperationAddedEvent
  | GroupOperationAddedEvent
  | RollbackEvent;
