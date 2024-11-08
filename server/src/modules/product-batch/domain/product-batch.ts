import _ from 'lodash';
import { v7 as uuidV7 } from 'uuid';

import { isNil } from '@/common/helpers/utils.js';
import type { ProductBatchProps } from '@/product-batch/domain/product-batch.interfaces.js';
import type { ProductBatchReadEntity } from '@/product-batch/domain/product-batch.read-entity.js';

import {
  type GroupOperationAddedEvent,
  type GroupOperationAddedEventData,
  type OperationAddedEvent,
  type OperationAddedEventData,
  type ProductBatchChildCreatedEvent,
  type ProductBatchChildCreatedEventData,
  type ProductBatchCreatedEvent,
  type ProductBatchEvent,
  ProductBatchEventType,
  type ProductBatchMovedEvent,
  type ProductBatchMovedEventData,
  type ProductBatchRollbackEvent,
} from './product-batch.events.js';

export class ProductBatch {
  readonly id: number;
  private _props: ProductBatchProps;
  private _revision: number;
  private _events: ProductBatchEvent[] = [];
  private _shouldSplit = false;
  isDeleted = false;

  public static create({
    props,
    metadata = null,
  }: {
    props: ProductBatchProps;
    metadata?: Record<string, unknown> | null;
  }): ProductBatch {
    const productBatch = new ProductBatch({
      id: props.id,
      revision: 0,
    });
    const event: ProductBatchCreatedEvent =
      productBatch.createEvent<ProductBatchCreatedEvent>({
        type: ProductBatchEventType.ProductBatchCreated,
        data: _.cloneDeep(props),
        metadata,
        revision: 0,
      });

    productBatch.appendEvent(event);
    return productBatch;
  }

  public static createFromReadEntity(entity: ProductBatchReadEntity) {
    return new ProductBatch({
      id: entity.id,
      props: entity,
      revision: entity.revision,
      shouldSplit: entity.shouldSplit,
    });
  }

  public static buildProjection(origEvents: ProductBatchEvent[]): ProductBatch {
    const events = _.cloneDeep(origEvents).toSorted(
      (a, b) => a.revision - b.revision,
    );

    if (events[0].type != ProductBatchEventType.ProductBatchCreated) {
      throw new Error('error in first event');
    }

    const productBatch = new ProductBatch({
      id: events[0].data.id,
    });

    productBatch.applyEvents(events);
    return productBatch;
  }

  public static createFromSources(data: {
    id: number;
    count: number;
    productId: number;
    weight: number;
    volume: number;
    statusId: number | null;
    groupId: number | null;
    order: number;
    sources: { qty: number; productBatch: ProductBatch }[];
  }): ProductBatch {
    const sourceEvents: ProductBatchChildCreatedEvent[] = [];
    data.sources.forEach(item => {
      sourceEvents.push(
        item.productBatch.appendChildCreatedEvent({
          childId: data.id,
          qty: item.qty,
          count: item.qty * data.count,
        }),
      );
    });

    return this.create({
      props: {
        id: data.id,
        count: data.count,
        initialCount: data.count,
        productId: data.productId,
        costPricePerUnit: data.sources.reduce(
          (prev, cur) =>
            prev + cur.productBatch.toObject().costPricePerUnit * cur.qty,
          0,
        ),
        exchangeRate: null,
        operationsPrice: data.sources.reduce(
          (prev, cur) =>
            prev + cur.productBatch.toObject().operationsPrice * cur.qty,
          0,
        ),
        operationsPricePerUnit: data.sources.reduce(
          (prev, cur) =>
            prev + cur.productBatch.toObject().operationsPricePerUnit * cur.qty,
          0,
        ),
        currencyCostPricePerUnit: null,
        statusId: data.statusId,
        groupId: data.groupId,
        sourceIds: data.sources.map(item => item.productBatch.id),
        order: data.order,
        weight: data.weight,
        volume: data.volume,
      },
      metadata: { sourceEvents },
    });
  }

  private constructor({
    id,
    revision,
    props,
    shouldSplit,
  }: {
    id: number;
    revision?: number;
    props?: ProductBatchProps;
    shouldSplit?: boolean;
  }) {
    this.id = id;
    if (!isNil(revision)) this._revision = revision;
    if (props) this._props = _.cloneDeep(props);
    if (shouldSplit) this._shouldSplit = shouldSplit;
  }

  public rebuild() {
    this.applyEvents(this._events);
  }

  private createEvent<T extends ProductBatchEvent>(
    event: Omit<T, 'id' | 'revision'> & { revision?: number },
  ): T {
    return {
      ...event,
      id: uuidV7(),
      revision: event.revision ?? this._revision + 1,
      isNew: true,
    } as T;
  }

  private applyEvent(event: ProductBatchEvent) {
    switch (event.type) {
      case ProductBatchEventType.ProductBatchCreated:
        this._props = _.cloneDeep(event.data);
        break;
      case ProductBatchEventType.ProductBatchChildCreated:
        this._props.count -= event.data.count;
        if (this._props.count < 0)
          throw new Error('count не может быть меньше 0');
        this._shouldSplit = true;
        break;
      case ProductBatchEventType.ProductBatchDeleted:
        break;
      case ProductBatchEventType.ProductBatchEdited:
        this._props.statusId = event.data.statusId;

        break;
      case ProductBatchEventType.ProductBatchMoved:
        this._props = { ...this._props, ..._.cloneDeep(event.data) };
        this._shouldSplit = false;
        break;
      case ProductBatchEventType.GroupOperationAdded:
      case ProductBatchEventType.OperationAdded:
        {
          const operationPricePerUnit = event.data.cost / this._props.count;

          this._props.operationsPricePerUnit += Number(
            operationPricePerUnit.toFixed(0),
          );
          this._props.operationsPrice = event.data.cost;
        }
        this._shouldSplit = false;

        break;
      case ProductBatchEventType.Rollback:
        // skip
        break;
      default:
        throw new Error('unknown eventType');
    }
  }

  private appendEvent(event: ProductBatchEvent): void {
    this._events.push(event);
    this.applyEvent(event);
    this._revision = event.revision;
  }

  applyEvents(events: ProductBatchEvent[]) {
    const _rolledBackEventIds = events.flatMap(event =>
      event.type == ProductBatchEventType.Rollback
        ? [event.rollbackTargetId]
        : [],
    );

    this._events = events.map(event => ({
      ...event,
      isRolledBack: _rolledBackEventIds.includes(event.id),
    }));

    const nonRolledBackEvents = this._events.filter(
      event =>
        !event.isRolledBack && event.type != ProductBatchEventType.Rollback,
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

  getUncommittedEvents(): ProductBatchEvent[] {
    return this._events.filter(item => item.isNew);
  }

  getEvents(): ProductBatchEvent[] {
    return this._events;
  }

  commitEvents() {
    this._events.forEach(item => (item.isNew = false));
  }

  getId(): number {
    return this.id;
  }

  getProductId(): number {
    return this._props.productId;
  }

  getOrder(): number {
    return this._props.order;
  }

  shouldSplit(): boolean {
    return this._shouldSplit;
  }

  toObject() {
    return {
      ...this._props,
      id: this.id,
      revision: this._revision,
      shouldSplit: this._shouldSplit,
    };
  }

  public appendChildCreatedEvent(
    data: ProductBatchChildCreatedEventData,
    metadata: Record<string, unknown> | null = null,
  ) {
    const event = this.createEvent<ProductBatchChildCreatedEvent>({
      type: ProductBatchEventType.ProductBatchChildCreated,
      data,
      metadata,
    });

    this.appendEvent(event);

    return event;
  }

  public move(
    { order, groupId, statusId }: ProductBatchMovedEventData,
    metadata: Record<string, unknown> | null = null,
  ): void {
    let valid = false;
    const data: ProductBatchMovedEventData = { order };
    if (this._props.order !== order) {
      valid = true;
    }
    if (statusId !== undefined && this._props.statusId !== statusId) {
      valid = true;
      data.statusId = statusId;
    }
    if (groupId !== undefined && this._props.groupId !== groupId) {
      valid = true;
      data.groupId = groupId;
    }

    if (valid) {
      const event = this.createEvent<ProductBatchMovedEvent>({
        type: ProductBatchEventType.ProductBatchMoved,
        data,
        metadata,
      });
      this.appendEvent(event);
    }
  }

  public addOperation(
    data: OperationAddedEventData,
    metadata: Record<string, unknown> | null = null,
  ): void {
    const event = this.createEvent<OperationAddedEvent>({
      type: ProductBatchEventType.OperationAdded,
      data,
      metadata,
    });
    this.appendEvent(event);
  }
  public appendGroupOperation(
    data: GroupOperationAddedEventData,
    metadata: Record<string, unknown>,
  ): void {
    const event: GroupOperationAddedEvent = this.createEvent({
      type: ProductBatchEventType.GroupOperationAdded,
      data,
      metadata,
    });
    this.appendEvent(event);
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

    const rollbackEvent: ProductBatchRollbackEvent = this.createEvent({
      type: ProductBatchEventType.Rollback,
      data: null,
      rollbackTargetId,
      metadata,
    });
    this.appendEvent(rollbackEvent);
  }

  revertEvent(event: ProductBatchRollbackEvent) {
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
