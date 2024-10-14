import _ from 'lodash';
import { v7 as uuidV7 } from 'uuid';

import { isNil } from '@/common/helpers/utils.js';

import {
  type ProductCreatedEvent,
  type ProductEvent,
  ProductEventType,
} from './product.events.js';
import type { ProductProps } from './product.interfaces.js';
import type { ProductReadEntity } from './product.read-entity.js';

export class Product {
  readonly id: number;
  private _props: ProductProps;
  private _revision: number;
  private _uncommittedEvents: ProductEvent[] = [];
  private _events: ProductEvent[] = [];
  isDeleted = false;

  public static create({
    props,
    metadata = null,
  }: {
    props: ProductProps;
    metadata?: Record<string, unknown> | null;
  }): Product {
    const product = new Product({
      id: props.id,
      revision: 0,
    });
    const event = product.createEvent<ProductCreatedEvent>({
      type: ProductEventType.ProductCreated,
      data: props,
      metadata,
      revision: 0,
    });

    product.appendEvent(event);
    return product;
  }

  public static createFromReadEntity(entity: ProductReadEntity) {
    return new Product({
      id: entity.id,
      props: entity,
      revision: entity.revision,
    });
  }

  public static buildProjection(origEvents: ProductEvent[]): Product {
    const events = _.cloneDeep(origEvents).toSorted(
      (a, b) => a.revision - b.revision,
    );

    if (events[0].type != ProductEventType.ProductCreated) {
      throw new Error('error in first event');
    }

    const product = new Product({
      id: events[0].data.id,
    });

    product.applyEvents(events);
    return product;
  }

  private constructor({
    id,
    revision,
    props,
  }: {
    id: number;
    revision?: number;
    props?: ProductProps;
  }) {
    this.id = id;

    if (!isNil(revision)) this._revision = revision;
    if (props) this._props = props;
  }

  private createEvent<T extends ProductEvent>(
    event: Omit<T, 'id' | 'revision'> & { revision?: number },
  ): T {
    return Object.freeze({
      ...event,
      id: uuidV7(),
      revision: event.revision ?? this._revision + 1,
    }) as T;
  }

  private applyEvent(event: ProductEvent) {
    switch (event.type) {
      case ProductEventType.ProductCreated:
        this._props = event.data;
        break;

      case ProductEventType.ProductArchived:
        // if (event.data.name) {
        //   this.name = event.data.name;
        // }
        // if (event.data.quantity) {
        //   this.quantity = event.data.quantity;
        // }
        break;
      case ProductEventType.ProductEdited:
        this._props.name = event.data.name;

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

  private appendEvent(event: ProductEvent): void {
    this._events.push(event);
    this._uncommittedEvents.push(event);
    this.applyEvent(event);
    this._revision = event.revision;
  }

  applyEvents(events: ProductEvent[]) {
    this._events = events;
    const rollbackEventIds = events
      .flatMap(event =>
        event.type == ProductEventType.Rollback ? [event] : [],
      )
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

  getUncommittedEvents(): ProductEvent[] {
    return this._uncommittedEvents;
  }

  clearEvents() {
    this._uncommittedEvents = [];
  }

  getId(): number {
    return this.id;
  }

  getWeight(): number {
    return this._props.weight;
  }

  getVolume(): number {
    const volume =
      (((this._props.width * this._props.height * this._props.length) /
        1000_000) *
        100) /
      100;

    return Number(volume.toFixed(2));
  }

  toObject() {
    return { ...this._props, id: this.id, revision: this._revision };
  }
}
