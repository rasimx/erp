import { type UID } from '@/product-batch/domain/product-batch.events.js';
import type { AddGroupOperationDto } from '@/product-batch-group/dtos/add-group-operation.dto.js';
import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';

export enum ProductBatchGroupEventType {
  ProductBatchGroupCreated = 'ProductBatchGroupCreated',
  ProductBatchGroupDeleted = 'ProductBatchGroupDeleted',
  ProductBatchGroupMoved = 'ProductBatchGroupMoved',
  GroupOperationAdded = 'GroupOperationAdded',
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

export interface GroupOperationAddedEventData extends AddGroupOperationDto {
  id: number;
}

export interface GroupOperationCreatedEvent {
  id: UID;
  type: ProductBatchGroupEventType.GroupOperationAdded;
  data: GroupOperationAddedEventData;
  metadata?: Record<string, unknown>;
}

export type ProductBatchGroupEvent =
  | ProductBatchGroupCreatedEvent
  | ProductBatchGroupMovedEvent
  | ProductBatchGroupDeletedEvent
  | GroupOperationCreatedEvent;

export type RevisionProductBatchGroupEvent = ProductBatchGroupEvent & {
  revision: number;
};
