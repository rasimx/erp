import { type UID } from '@/product-batch/domain/product-batch.events.js';
import type { AddGroupOperationDto } from '@/product-batch-group/dtos/add-group-operation.dto.js';
import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';

export interface BaseEvent {
  id: UID;
  revision: number;
  metadata: Record<string, unknown> | null;
}

export enum ProductBatchGroupEventType {
  ProductBatchGroupCreated = 'ProductBatchGroupCreated',
  ProductBatchGroupDeleted = 'ProductBatchGroupDeleted',
  ProductBatchGroupMoved = 'ProductBatchGroupMoved',
  GroupOperationAdded = 'GroupOperationAdded',
  Rollback = 'Rollback',
}

export interface ProductBatchGroupCreatedEventData
  extends CreateProductBatchGroupDto {
  id: number;
  order: number;
}

export interface ProductBatchGroupCreatedEvent extends BaseEvent {
  type: ProductBatchGroupEventType.ProductBatchGroupCreated;
  data: ProductBatchGroupCreatedEventData;
}

export interface ProductBatchGroupMovedEventData {
  order: number;
  statusId?: number | null;
}

export interface ProductBatchGroupMovedEvent extends BaseEvent {
  type: ProductBatchGroupEventType.ProductBatchGroupMoved;
  data: ProductBatchGroupMovedEventData;
}

export interface ProductBatchGroupDeletedEvent extends BaseEvent {
  type: ProductBatchGroupEventType.ProductBatchGroupDeleted;
  data: null;
}

export interface GroupOperationAddedEventData extends AddGroupOperationDto {
  id: number;
}

export interface GroupOperationCreatedEvent extends BaseEvent {
  type: ProductBatchGroupEventType.GroupOperationAdded;
  data: GroupOperationAddedEventData;
}

export interface RollbackEvent extends BaseEvent {
  type: ProductBatchGroupEventType.Rollback;
  data: unknown;
  rollbackTargetId: string;
}

export type ProductBatchGroupEvent =
  | ProductBatchGroupCreatedEvent
  | ProductBatchGroupMovedEvent
  | ProductBatchGroupDeletedEvent
  | GroupOperationCreatedEvent
  | RollbackEvent;
