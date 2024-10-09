import { v7 as uuidV7 } from 'uuid';

import {
  ProductBatchEventType,
  type ProductBatchMovedEvent,
  type ProductBatchMovedEventData,
} from '@/product-batch/domain/product-batch.events.js';

import {
  type RevisionStatusEvent,
  type StatusCreatedEvent,
  type StatusCreatedEventData,
  type StatusEvent,
  StatusEventType,
  type StatusMovedEvent,
  type StatusMovedEventData,
} from './status.events.js';
import type { CreateStatusProps, StatusProps } from './status.interfaces.js';

export class Status {
  readonly id: number;
  private revision: number;
  private events: RevisionStatusEvent[] = [];
  constructor(private props: StatusProps) {
    if (!props.id) throw new Error('id must be defined');
    this.id = Number(props.id);
  }

  public static create(
    props: CreateStatusProps,
    metadata?: Record<string, unknown>,
  ): Status {
    const status = new Status({
      ...props,
    });

    const event: StatusCreatedEvent = {
      id: uuidV7(),
      type: StatusEventType.StatusCreated,
      data: status.toObject(),
      metadata,
    };

    status.revision = 0;
    status.events.push({ ...event, revision: status.revision });

    return status;
  }

  public static buildFromEvents(origEvents: RevisionStatusEvent[]) {
    const events = [...origEvents].toSorted((a, b) => a.revision - b.revision);
    const zeroEvent = events.shift();

    if (!zeroEvent) throw new Error('not found');

    const status = new Status(zeroEvent.data as StatusCreatedEventData);
    status.revision = zeroEvent.revision;

    events.forEach(event => {
      status.applyEvent(event);
      status.revision = event.revision;
    });

    return status;
  }

  private appendEvent(event: StatusEvent): void {
    this.revision++;
    this.events.push({ ...event, revision: this.revision });
    if (event.type !== StatusEventType.StatusCreated) {
      this.applyEvent(event);
    }
  }

  private applyEvent(event: StatusEvent) {
    switch (event.type) {
      // case ProductBatchEventType.ProductBatchCreated:
      //   this.props = event.data;
      //   break;

      case StatusEventType.StatusArchived:
        // if (event.data.name) {
        //   this.name = event.data.name;
        // }
        // if (event.data.quantity) {
        //   this.quantity = event.data.quantity;
        // }
        break;
      case StatusEventType.StatusEdited:
        this.props.title = event.data.title;

        // if (event.data.name) {
        //   this.name = event.data.name;
        // }
        // if (event.data.quantity) {
        //   this.quantity = event.data.quantity;
        // }
        break;
      case StatusEventType.StatusMoved:
        this.props.order = event.data.order;

        // if (event.data.name) {
        //   this.name = event.data.name;
        // }
        // if (event.data.quantity) {
        //   this.quantity = event.data.quantity;
        // }
        break;
      default:
        throw new Error('unknown eventType');
    }
  }

  getUncommittedEvents(): RevisionStatusEvent[] {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }

  getId(): number {
    return this.id;
  }
  getOrder(): number {
    return this.props.order;
  }

  public move(data: StatusMovedEventData): void {
    const event: StatusMovedEvent = {
      id: uuidV7(),
      type: StatusEventType.StatusMoved,
      data,
    };
    this.appendEvent(event);
  }

  toObject() {
    return { ...this.props, id: this.id, revision: this.revision };
  }
}
