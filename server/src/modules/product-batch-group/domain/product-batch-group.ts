import _ from 'lodash';
import { v7 as uuidV7 } from 'uuid';

import { isNil } from '@/common/helpers/utils.js';
import type { ProductBatchGroupProps } from '@/product-batch-group/domain/product-batch-group.interfaces.js';
import type { ProductBatchGroupReadEntity } from '@/product-batch-group/domain/product-batch-group.read-entity.js';

import {
  type GroupOperationAddedEventData,
  type GroupOperationCreatedEvent,
  type ProductBatchGroupCreatedEvent,
  type ProductBatchGroupEvent,
  ProductBatchGroupEventType,
  type ProductBatchGroupMovedEvent,
  type ProductBatchGroupMovedEventData,
} from './product-batch-group.events.js';

export class ProductBatchGroup {
  readonly id: number;
  private _props: ProductBatchGroupProps;
  private _revision: number;
  private _uncommittedEvents: ProductBatchGroupEvent[] = [];
  private _events: ProductBatchGroupEvent[] = [];
  isDeleted = false;

  public static create({
    props,
    metadata = null,
  }: {
    props: ProductBatchGroupProps;
    metadata?: Record<string, unknown> | null;
  }): ProductBatchGroup {
    const productBatchGroup = new ProductBatchGroup({
      id: props.id,
      revision: 0,
    });

    const event = Object.freeze(
      productBatchGroup.createEvent<ProductBatchGroupCreatedEvent>({
        type: ProductBatchGroupEventType.ProductBatchGroupCreated,
        data: props,
        metadata,
        revision: 0,
      }),
    );
    productBatchGroup.appendEvent(event);

    return productBatchGroup;
  }

  public static createFromReadEntity(entity: ProductBatchGroupReadEntity) {
    return new ProductBatchGroup({
      id: entity.id,
      props: entity,
      revision: entity.revision,
    });
  }

  public static buildProjection(
    origEvents: ProductBatchGroupEvent[],
  ): ProductBatchGroup {
    const events = _.cloneDeep(origEvents).toSorted(
      (a, b) => a.revision - b.revision,
    );

    if (events[0].type != ProductBatchGroupEventType.ProductBatchGroupCreated) {
      throw new Error('error in first event');
    }

    const productBatchGroup = new ProductBatchGroup({
      id: events[0].data.id,
    });

    productBatchGroup.applyEvents(events);
    return productBatchGroup;
  }

  private constructor({
    id,
    revision,
    props,
  }: {
    id: number;
    revision?: number;
    props?: ProductBatchGroupProps;
  }) {
    this.id = id;
    if (!isNil(revision)) this._revision = revision;
    if (props) this._props = props;
  }

  private createEvent<T extends ProductBatchGroupEvent>(
    event: Omit<T, 'id' | 'revision'> & { revision?: number },
  ): T {
    return Object.freeze({
      ...event,
      id: uuidV7(),
      revision: event.revision ?? this._revision + 1,
    }) as T;
  }

  getId(): number {
    return this.id;
  }
  toObject() {
    return { ...this._props, revision: this._revision, id: this.id };
  }

  private applyEvent(event: ProductBatchGroupEvent) {
    switch (event.type) {
      case ProductBatchGroupEventType.ProductBatchGroupCreated:
        this._props = event.data;
        break;
      case ProductBatchGroupEventType.ProductBatchGroupMoved:
        if (event.data.statusId) {
          this._props.statusId = event.data.statusId;
        }
        if (event.data.order) {
          this._props.order = event.data.order;
        }

        // if (event.data.name) {
        //   this.name = event.data.name;
        // }
        // if (event.data.quantity) {
        //   this.quantity = event.data.quantity;
        // }
        break;
      case ProductBatchGroupEventType.ProductBatchGroupDeleted:
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

  private appendEvent(event: ProductBatchGroupEvent): void {
    this._events.push(event);
    this._uncommittedEvents.push(event);
    this.applyEvent(event);
    this._revision = event.revision;
  }

  applyEvents(events: ProductBatchGroupEvent[]) {
    this._events = events;
    const rollbackEventIds = events
      .flatMap(event =>
        event.type == ProductBatchGroupEventType.Rollback ? [event] : [],
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

  getUncommittedEvents(): ProductBatchGroupEvent[] {
    return this._uncommittedEvents;
  }

  clearEvents() {
    this._uncommittedEvents = [];
  }

  public move(
    eventData: ProductBatchGroupMovedEventData,
    metadata: Record<string, unknown> | null = null,
  ): void {
    let valid = false;
    const data: ProductBatchGroupMovedEventData = { order: eventData.order };
    if (this._props.order !== eventData.order) {
      valid = true;
    }
    if (this._props.statusId !== eventData.statusId) {
      valid = true;
      data.statusId = eventData.statusId;
    }

    if (valid) {
      const event = this.createEvent<ProductBatchGroupMovedEvent>({
        type: ProductBatchGroupEventType.ProductBatchGroupMoved,
        data,
        metadata,
      });
      this.appendEvent(event);
    }
  }

  public addOperation({
    id,
    data,
    metadata = null,
  }: {
    id?: string;
    data: GroupOperationAddedEventData;
    metadata?: Record<string, unknown> | null;
  }): void {
    const event = this.createEvent<GroupOperationCreatedEvent>({
      type: ProductBatchGroupEventType.GroupOperationAdded,
      data,
      metadata,
    });
    if (id) event.id = id;
    this.appendEvent(event);
  }

  // changeStatus(statusId: number) {
  //   const event: ProductBatchEditedEvent = {
  //     type: ProductBatchEventType.ProductBatchEdited,
  //     data: { statusId },
  //   };
  //
  //   this.applyEvent(event);
  //   this.events.push(event);
  //
  //   return this;
  // }
}
