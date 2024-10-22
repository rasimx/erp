import { Field } from '@nestjs/graphql';

import { type UID } from '@/product-batch/domain/product-batch.events.js';
import type { AddGroupOperationDto } from '@/product-batch-group/dtos/add-group-operation.dto.js';
import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';

export interface BaseEvent {
  id: UID;
  revision: number;
  metadata: Record<string, unknown> | null;
  rollbackTargetId?: string | null;
  isNew?: boolean;
  isRolledBack?: boolean;
  isJustRolledBack?: boolean;
  isReverted?: boolean;
}

export enum ProductBatchGroupEventType {
  ProductBatchGroupCreated = 'ProductBatchGroupCreated',
  ProductBatchGroupDeleted = 'ProductBatchGroupDeleted',
  ProductBatchGroupMoved = 'ProductBatchGroupMoved',
  GroupOperationAdded = 'GroupOperationAdded',
  Rollback = 'Rollback',
}

export interface ProductBatchGroupCreatedEventData {
  statusId: number;
  name: string;
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

export interface GroupOperationAddedEvent extends BaseEvent {
  type: ProductBatchGroupEventType.GroupOperationAdded;
  data: GroupOperationAddedEventData;
}

export interface ProductBatchGroupRollbackEvent extends BaseEvent {
  type: ProductBatchGroupEventType.Rollback;
  data: null;
  rollbackTargetId: string;
}

export type ProductBatchGroupEvent =
  | ProductBatchGroupCreatedEvent
  | ProductBatchGroupMovedEvent
  | ProductBatchGroupDeletedEvent
  | GroupOperationAddedEvent
  | ProductBatchGroupRollbackEvent;
