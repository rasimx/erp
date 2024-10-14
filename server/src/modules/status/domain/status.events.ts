import type { ProductBatchEventType } from '@/product-batch/domain/product-batch.events.js';
import type { CreateStatusDto } from '@/status/dtos/create-status.dto.js';

export enum StatusEventType {
  StatusCreated = 'StatusCreated',
  StatusEdited = 'StatusEdited',
  StatusMoved = 'StatusMoved',
  StatusArchived = 'StatusArchived',
  Rollback = 'Rollback',
}

export type UID = string;

export interface BaseEvent {
  id: UID;
  revision: number;
  metadata: Record<string, unknown> | null;
  rollbackTargetId?: string | null;
}

export interface StatusCreatedEventData extends CreateStatusDto {
  id: number;
  order: number;
}
export interface StatusCreatedEvent extends BaseEvent {
  type: StatusEventType.StatusCreated;
  data: StatusCreatedEventData;
}

export interface StatusEditedEventData {
  title: string;
}
export interface StatusEditedEvent extends BaseEvent {
  type: StatusEventType.StatusEdited;
  data: StatusEditedEventData;
}

export interface StatusMovedEventData {
  order: number;
}
export interface StatusMovedEvent extends BaseEvent {
  type: StatusEventType.StatusMoved;
  data: StatusMovedEventData;
}

export interface StatusArchivedEventData {
  id: number;
}
export interface StatusArchivedEvent extends BaseEvent {
  type: StatusEventType.StatusArchived;
  data: StatusArchivedEventData;
}

export interface RollbackEvent extends BaseEvent {
  type: StatusEventType.Rollback;
  data: unknown;
  rollbackTargetId: string;
}

export type StatusEvent =
  | StatusCreatedEvent
  | StatusEditedEvent
  | StatusMovedEvent
  | StatusArchivedEvent
  | RollbackEvent;

export type RevisionStatusEvent = StatusEvent & {
  revision: number;
};
