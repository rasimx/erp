import type { CreateStatusDto } from '@/status/dtos/create-status.dto.js';

export enum StatusEventType {
  StatusCreated = 'StatusCreated',
  StatusEdited = 'StatusEdited',
  StatusMoved = 'StatusMoved',
  StatusArchived = 'StatusArchived',
}

export type UID = string;

export interface StatusCreatedEventData extends CreateStatusDto {
  id: number;
  order: number;
}
export interface StatusCreatedEvent {
  id: UID;
  type: StatusEventType.StatusCreated;
  data: StatusCreatedEventData;
  metadata?: Record<string, unknown>;
}

export interface StatusEditedEventData {
  title: string;
}
export interface StatusEditedEvent {
  id: UID;
  type: StatusEventType.StatusEdited;
  data: StatusEditedEventData;
  metadata?: Record<string, unknown>;
}

export interface StatusMovedEventData {
  order: number;
}
export interface StatusMovedEvent {
  id: UID;
  type: StatusEventType.StatusMoved;
  data: StatusMovedEventData;
  metadata?: Record<string, unknown>;
}

export interface StatusArchivedEventData {
  id: number;
}
export interface StatusArchivedEvent {
  id: UID;
  type: StatusEventType.StatusArchived;
  data: StatusArchivedEventData;
  metadata?: Record<string, unknown>;
}

export type StatusEvent =
  | StatusCreatedEvent
  | StatusEditedEvent
  | StatusMovedEvent
  | StatusArchivedEvent;

export type RevisionStatusEvent = StatusEvent & {
  revision: number;
};
