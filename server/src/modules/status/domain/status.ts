import _ from 'lodash';
import { v7 as uuidV7 } from 'uuid';

import { isNil } from '@/common/helpers/utils.js';
import type { StatusReadEntity } from '@/status/domain/status.read-entity.js';

import {
  type StatusCreatedEvent,
  type StatusEvent,
  StatusEventType,
  type StatusMovedEvent,
  type StatusMovedEventData,
} from './status.events.js';
import type { StatusProps } from './status.interfaces.js';

export class Status {
  readonly id: number;
  private _props: StatusProps;
  private _revision: number;
  private _uncommittedEvents: StatusEvent[] = [];
  private _events: StatusEvent[] = [];
  isDeleted = false;

  public static create({
    props,
    metadata = null,
  }: {
    props: StatusProps;
    metadata?: Record<string, unknown> | null;
  }): Status {
    const status = new Status({
      id: props.id,
      revision: 0,
    });
    const event = status.createEvent<StatusCreatedEvent>({
      type: StatusEventType.StatusCreated,
      data: props,
      metadata,
      revision: 0,
    });

    status.appendEvent(event);
    return status;
  }

  public static createFromReadEntity(entity: StatusReadEntity) {
    return new Status({
      id: entity.id,
      props: entity,
      revision: entity.revision,
    });
  }

  public static buildProjection(origEvents: StatusEvent[]): Status {
    const events = _.cloneDeep(origEvents).toSorted(
      (a, b) => a.revision - b.revision,
    );

    if (events[0].type != StatusEventType.StatusCreated) {
      throw new Error('error in first event');
    }

    const status = new Status({
      id: events[0].data.id,
    });

    status.applyEvents(events);
    return status;
  }

  private constructor({
    id,
    revision,
    props,
  }: {
    id: number;
    revision?: number;
    props?: StatusProps;
  }) {
    this.id = id;

    if (!isNil(revision)) this._revision = revision;
    if (props) this._props = props;
  }

  private createEvent<T extends StatusEvent>(
    event: Omit<T, 'id' | 'revision'> & { revision?: number },
  ): T {
    return Object.freeze({
      ...event,
      id: uuidV7(),
      revision: event.revision ?? this._revision + 1,
    }) as T;
  }

  private applyEvent(event: StatusEvent) {
    switch (event.type) {
      case StatusEventType.StatusCreated:
        this._props = event.data;
        break;

      case StatusEventType.StatusArchived:
        // todoz
        break;
      case StatusEventType.StatusEdited:
        this._props.title = event.data.title;
        /// todo
        break;
      case StatusEventType.StatusMoved:
        this._props.order = event.data.order;
        break;
      case StatusEventType.Rollback:
        // skip
        break;
      default:
        throw new Error('unknown eventType');
    }
  }

  private appendEvent(event: StatusEvent): void {
    this._events.push(event);
    this._uncommittedEvents.push(event);
    this.applyEvent(event);
    this._revision = event.revision;
  }

  applyEvents(events: StatusEvent[]) {
    this._events = events;
    const rollbackEventIds = events
      .flatMap(event => (event.type == StatusEventType.Rollback ? [event] : []))
      .map(item => item.rollbackTargetId);

    const nonRolledBackEvents = events.filter(
      event => !rollbackEventIds.includes(event.id),
    );
    if (nonRolledBackEvents.length > 0) {
      nonRolledBackEvents.forEach((event, index) => {
        this.applyEvent(event);
      });
    } else {
      this.isDeleted = true;
    }
    this._revision = events[events.length - 1].revision;
  }

  getUncommittedEvents(): StatusEvent[] {
    return this._uncommittedEvents;
  }

  getEvents(): StatusEvent[] {
    return this._events;
  }

  clearEvents() {
    this._uncommittedEvents = [];
  }

  toObject() {
    return { ...this._props, id: this.id, revision: this._revision };
  }

  getId(): number {
    return this.id;
  }
  getOrder(): number {
    return this._props.order;
  }

  public move(
    data: StatusMovedEventData,
    metadata: Record<string, unknown> | null = null,
  ): void {
    const event = this.createEvent<StatusMovedEvent>({
      type: StatusEventType.StatusMoved,
      data,
      metadata,
    });
    this.appendEvent(event);
  }
}
