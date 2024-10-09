import { v7 as uuidV7 } from 'uuid';

import type {
  CreateProductBatchProps,
  ProductBatchProps,
} from '@/product-batch/domain/product-batch.interfaces.js';

import {
  type GroupOperationCreatedEvent,
  type GroupOperationCreatedEventData,
  type OperationCreatedEvent,
  type OperationCreatedEventData,
  type ProductBatchChildCreatedEvent,
  type ProductBatchCreatedEvent,
  type ProductBatchCreatedEventData,
  type ProductBatchEditedEvent,
  type ProductBatchEvent,
  ProductBatchEventType,
  type ProductBatchMovedEvent,
  type ProductBatchMovedEventData,
  type RevisionProductBatchEvent,
} from './product-batch.events.js';

export class ProductBatch {
  readonly id: number;
  private revision: number;
  private events: RevisionProductBatchEvent[] = [];
  private constructor(private props: ProductBatchProps) {
    if (!props.id) throw new Error('id must be defined');
    this.id = Number(props.id);
  }

  public static create(
    props: CreateProductBatchProps,
    metadata?: Record<string, unknown>,
  ): ProductBatch {
    const productBatch = new ProductBatch({
      ...props,
      initialCount: props.count,
    });

    const event: ProductBatchCreatedEvent = {
      id: uuidV7(),
      type: ProductBatchEventType.ProductBatchCreated,
      data: productBatch.toObject(),
      metadata,
    };

    productBatch.revision = 0;
    productBatch.events.push({ ...event, revision: productBatch.revision });

    return productBatch;
  }

  public static createFromSources(data: {
    id: number;
    count: number;
    productId: number;
    statusId: number | null;
    groupId: number | null;
    order: number;
    sources: { qty: number; productBatch: ProductBatch }[];
  }): ProductBatch {
    const sourceEvents: ProductBatchChildCreatedEvent[] = [];
    data.sources.forEach(item => {
      const event: ProductBatchChildCreatedEvent = {
        id: uuidV7(),
        type: ProductBatchEventType.ProductBatchChildCreated,
        data: {
          childId: data.id,
          qty: item.qty,
          count: item.qty * data.count,
        },
      };
      item.productBatch.appendEvent(event);
      sourceEvents.push(event);
    });

    return ProductBatch.create(
      {
        id: data.id,
        count: data.count,
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
      },
      { sourceEvents },
    );
  }

  public static buildFromEvents(origEvents: RevisionProductBatchEvent[]) {
    const events = [...origEvents].toSorted((a, b) => a.revision - b.revision);
    const zeroEvent = events.shift();

    if (!zeroEvent) throw new Error('not found');

    const productBatch = new ProductBatch(
      zeroEvent.data as ProductBatchCreatedEventData,
    );
    productBatch.revision = zeroEvent.revision;

    events.forEach(event => {
      productBatch.applyEvent(event);
      productBatch.revision = event.revision;
    });

    return productBatch;
  }

  private appendEvent(event: ProductBatchEvent): void {
    this.revision++;
    this.events.push({ ...event, revision: this.revision });
    if (event.type !== ProductBatchEventType.ProductBatchCreated) {
      this.applyEvent(event);
    }
  }

  private applyEvent(event: ProductBatchEvent) {
    switch (event.type) {
      // case ProductBatchEventType.ProductBatchCreated:
      //   this.props = event.data;
      //   break;
      case ProductBatchEventType.ProductBatchChildCreated:
        this.props.count -= event.data.count;
        if (this.props.count < 0)
          throw new Error('count не может быть меньше 0');
        break;

      case ProductBatchEventType.ProductBatchDeleted:
        // if (event.data.name) {
        //   this.name = event.data.name;
        // }
        // if (event.data.quantity) {
        //   this.quantity = event.data.quantity;
        // }
        break;
      case ProductBatchEventType.ProductBatchEdited:
        this.props.statusId = event.data.statusId;

        // if (event.data.name) {
        //   this.name = event.data.name;
        // }
        // if (event.data.quantity) {
        //   this.quantity = event.data.quantity;
        // }
        break;
      case ProductBatchEventType.ProductBatchMoved:
        this.props = { ...this.props, ...event.data };
        break;
      case ProductBatchEventType.GroupOperationCreated:
      case ProductBatchEventType.OperationCreated:
        {
          const operationPricePerUnit = event.data.cost / this.props.count;

          this.props.operationsPricePerUnit += Number(
            operationPricePerUnit.toFixed(0),
          );
          this.props.operationsPrice = event.data.cost;
        }

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

  getUncommittedEvents(): RevisionProductBatchEvent[] {
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
  getProductId(): number {
    return this.props.productId;
  }
  getStatusId(): number | null {
    return this.props.statusId;
  }
  getGroupId(): number | null {
    return this.props.groupId;
  }

  getCostPricePerUnit(): number {
    return this.props.costPricePerUnit;
  }

  toObject() {
    return { ...this.props, id: this.id, revision: this.revision };
  }

  public move({ order, groupId, statusId }: ProductBatchMovedEventData): void {
    let valid = false;
    const data: ProductBatchMovedEventData = { order };
    if (this.props.order !== order) {
      valid = true;
    }
    if (statusId !== undefined && this.props.statusId !== statusId) {
      valid = true;
      data.statusId = statusId;
    }
    if (groupId !== undefined && this.props.groupId !== groupId) {
      valid = true;
      data.groupId = groupId;
    }

    if (valid) {
      const event: ProductBatchMovedEvent = {
        id: uuidV7(),
        type: ProductBatchEventType.ProductBatchMoved,
        data,
      };
      this.appendEvent(event);
    }
  }

  public appendOperation(
    data: OperationCreatedEventData,
    metadata?: Record<string, unknown>,
  ): void {
    const event: OperationCreatedEvent = {
      id: uuidV7(),
      type: ProductBatchEventType.OperationCreated,
      data,
      metadata,
    };
    this.appendEvent(event);
  }
  public appendGroupOperation(
    data: GroupOperationCreatedEventData,
    metadata?: Record<string, unknown>,
  ): void {
    const event: GroupOperationCreatedEvent = {
      id: uuidV7(),
      type: ProductBatchEventType.GroupOperationCreated,
      data,
      metadata,
    };
    this.appendEvent(event);
  }

  changeStatus(statusId: number) {
    const event: ProductBatchEditedEvent = {
      id: uuidV7(),
      type: ProductBatchEventType.ProductBatchEdited,
      data: { statusId },
    };

    this.appendEvent(event);

    return this;
  }
}
