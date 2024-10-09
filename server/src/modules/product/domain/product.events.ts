import type { CreateProductProps } from './product.interfaces.js';

export enum ProductEventType {
  ProductCreated = 'ProductCreated',
  ProductEdited = 'ProductEdited',
  ProductArchived = 'ProductArchived',
}

export type UID = string;

export type ProductCreatedEventData = CreateProductProps;
export interface ProductCreatedEvent {
  id: UID;
  type: ProductEventType.ProductCreated;
  data: ProductCreatedEventData;
  metadata?: Record<string, unknown>;
}

export interface ProductEditedEventData {
  name: string;
}
export interface ProductEditedEvent {
  id: UID;
  type: ProductEventType.ProductEdited;
  data: ProductEditedEventData;
  metadata?: Record<string, unknown>;
}

export interface ProductArchivedEventData {
  id: number;
}
export interface ProductArchivedEvent {
  id: UID;
  type: ProductEventType.ProductArchived;
  data: ProductArchivedEventData;
  metadata?: Record<string, unknown>;
}

export type ProductEvent =
  | ProductCreatedEvent
  | ProductEditedEvent
  | ProductArchivedEvent;

export type RevisionProductEvent = ProductEvent & {
  revision: number;
};
