import type { ProductProps } from './product.interfaces.js';

export enum ProductEventType {
  ProductCreated = 'ProductCreated',
  ProductEdited = 'ProductEdited',
  ProductArchived = 'ProductArchived',
  Rollback = 'Rollback',
}

export type UID = string;

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

export type ProductCreatedEventData = ProductProps;
export interface ProductCreatedEvent extends BaseEvent {
  type: ProductEventType.ProductCreated;
  data: ProductCreatedEventData;
}

export interface ProductEditedEventData {
  name: string;
}
export interface ProductEditedEvent extends BaseEvent {
  type: ProductEventType.ProductEdited;
  data: ProductEditedEventData;
}

export interface ProductArchivedEventData {
  id: number;
}
export interface ProductArchivedEvent extends BaseEvent {
  type: ProductEventType.ProductArchived;
  data: ProductArchivedEventData;
}

export interface ProductRollbackEvent extends BaseEvent {
  type: ProductEventType.Rollback;
  data: null;
  rollbackTargetId: string;
}

export type ProductEvent =
  | ProductCreatedEvent
  | ProductEditedEvent
  | ProductArchivedEvent
  | ProductRollbackEvent;
