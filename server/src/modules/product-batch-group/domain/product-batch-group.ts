import _ from 'lodash';
import { v7 as uuidV7 } from 'uuid';

import { isNil } from '@/common/helpers/utils.js';
import type { ProductBatchGroupProps } from '@/product-batch-group/domain/product-batch-group.interfaces.js';
import type { ProductBatchGroupReadEntity } from '@/product-batch-group/domain/product-batch-group.read-entity.js';

import {
  type GroupOperationAddedEvent,
  type GroupOperationAddedEventData,
  type ProductBatchGroupCreatedEvent,
  type ProductBatchGroupEvent,
  ProductBatchGroupEventType,
  type ProductBatchGroupMovedEvent,
  type ProductBatchGroupMovedEventData,
  type ProductBatchGroupRollbackEvent,
} from './product-batch-group.events.js';

export class AbstractProductBatchGroup {
  readonly id: number | null = null;
  protected _revision: number;
  protected _events: ProductBatchGroupEvent[] = [];

  public static createAbstract(): AbstractProductBatchGroup {
    return new AbstractProductBatchGroup();
  }

  protected constructor() {
    this._revision = 0;
  }

  getId(): number | null {
    return this.id;
  }

  public rebuild() {
    this.applyEvents(this._events);
  }

  protected createEvent<T extends ProductBatchGroupEvent>(
    event: Omit<T, 'id' | 'revision'> & { revision?: number },
  ): T {
    return {
      ...event,
      id: uuidV7(),
      revision: event.revision ?? this._revision + 1,
      isNew: true,
    } as T;
  }

  protected appendEvent(event: ProductBatchGroupEvent): void {
    this._events.push(event);
    this._revision = event.revision;
  }

  applyEvents(events: ProductBatchGroupEvent[]) {
    this._events = events;
    this._revision = events[events.length - 1].revision;
  }

  getUncommittedEvents(): ProductBatchGroupEvent[] {
    return this._events.filter(item => item.isNew);
  }

  commitEvents() {
    this._events.forEach(item => (item.isNew = false));
  }

  getEvents(): ProductBatchGroupEvent[] {
    return this._events;
  }

  public addGroupOperation(
    data: GroupOperationAddedEventData,
    metadata: Record<string, unknown> | null = null,
  ): GroupOperationAddedEvent {
    const event = this.createEvent<GroupOperationAddedEvent>({
      type: ProductBatchGroupEventType.GroupOperationAdded,
      data,
      metadata,
    });
    this.appendEvent(event);

    return event;
  }

  rollbackEvent(
    rollbackTargetId: string,
    metadata: Record<string, unknown> | null = null,
  ) {
    const rolledBackEvent = this._events.find(
      event => event.id === rollbackTargetId,
    );
    if (!rolledBackEvent) throw new Error('rolledBackEvent not found');
    rolledBackEvent.isRolledBack = true;
    rolledBackEvent.isJustRolledBack = true;

    const rollbackEvent: ProductBatchGroupRollbackEvent = this.createEvent({
      type: ProductBatchGroupEventType.Rollback,
      data: null,
      rollbackTargetId,
      metadata,
    });
    this.appendEvent(rollbackEvent);
  }

  revertEvent(event: ProductBatchGroupRollbackEvent) {
    // меняем флаг у события которое компенсироваролось
    const revertedEvent = this._events.find(
      item => item.id === event.rollbackTargetId,
    );
    if (!revertedEvent) throw new Error('revertedEvent not found');
    revertedEvent.isReverted = true;
    // удаляем rollbackEvent
    this._events = this._events.filter(item => item.id != event.id);
  }
}

export class RealProductBatchGroup extends AbstractProductBatchGroup {
  override id: number;
  private _props: ProductBatchGroupProps;
  isDeleted = false;

  public static create({
    props,
    metadata = null,
  }: {
    props: ProductBatchGroupProps;
    metadata?: Record<string, unknown> | null;
  }): RealProductBatchGroup {
    const productBatchGroup = new RealProductBatchGroup({
      id: props.id,
      revision: 0,
    });

    const event = productBatchGroup.createEvent<ProductBatchGroupCreatedEvent>({
      type: ProductBatchGroupEventType.ProductBatchGroupCreated,
      data: props,
      metadata,
      revision: 0,
    });
    productBatchGroup.appendEvent(event);

    return productBatchGroup;
  }

  public static createFromReadEntity(entity: ProductBatchGroupReadEntity) {
    return new RealProductBatchGroup({
      id: entity.id,
      props: entity,
      revision: entity.revision,
    });
  }

  public static buildProjection(
    origEvents: ProductBatchGroupEvent[],
  ): RealProductBatchGroup {
    const events = _.cloneDeep(origEvents).toSorted(
      (a, b) => a.revision - b.revision,
    );

    if (events[0].type != ProductBatchGroupEventType.ProductBatchGroupCreated) {
      throw new Error('error in first event');
    }

    const productBatchGroup = new RealProductBatchGroup({
      id: events[0].data.id,
    });

    productBatchGroup.applyEvents(events);
    return productBatchGroup;
  }

  protected constructor({
    id,
    revision,
    props,
  }: {
    id: number;
    revision?: number;
    props?: ProductBatchGroupProps;
  }) {
    super();
    this.id = id;
    if (!isNil(revision)) this._revision = revision;
    if (props) this._props = _.cloneDeep(props);
  }

  override getId(): number {
    return this.id;
  }
  toObject() {
    return { ...this._props, revision: this._revision, id: this.id };
  }

  private applyEvent(event: ProductBatchGroupEvent) {
    switch (event.type) {
      case ProductBatchGroupEventType.ProductBatchGroupCreated:
        this._props = _.cloneDeep(event.data);
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

      case ProductBatchGroupEventType.GroupOperationAdded:
        // if (event.data.name) {
        //   this.name = event.data.name;
        // }
        // if (event.data.quantity) {
        //   this.quantity = event.data.quantity;
        // }
        break;

      case ProductBatchGroupEventType.Rollback:
        // skip
        break;

      default:
        throw new Error('unknown eventType');
    }
  }

  protected appendEvent(event: ProductBatchGroupEvent): void {
    this._events.push(event);
    this.applyEvent(event);
    this._revision = event.revision;
  }

  applyEvents(events: ProductBatchGroupEvent[]) {
    const _rolledBackEventIds = events.flatMap(event =>
      event.type == ProductBatchGroupEventType.Rollback
        ? [event.rollbackTargetId]
        : [],
    );

    this._events = events.map(event => ({
      ...event,
      isRolledBack: _rolledBackEventIds.includes(event.id),
    }));

    const nonRolledBackEvents = this._events.filter(
      event =>
        !event.isRolledBack &&
        event.type != ProductBatchGroupEventType.Rollback,
    );
    if (nonRolledBackEvents.length > 0) {
      nonRolledBackEvents.forEach((event, index) => {
        this.applyEvent(event);
      });
      this.isDeleted = false;
    } else {
      this.isDeleted = true;
    }
    this._revision = events[events.length - 1].revision;
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
}

export type ProductBatchGroup =
  | RealProductBatchGroup
  | AbstractProductBatchGroup;
