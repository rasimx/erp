import type { ProductBatchProps } from '@/product-batch/domain/product-batch.interfaces.js';

import {
  type ProductBatchChildCreatedEvent,
  type ProductBatchChildCreatedEventData,
  type ProductBatchCreatedEvent,
  type ProductBatchCreatedEventData,
  type ProductBatchEditedEvent,
  type ProductBatchEvent,
  ProductBatchEventType,
} from './product-batch.events.js';

export class ProductBatch {
  readonly id: number;
  private events: ProductBatchEvent[] = [];
  private constructor(private props: ProductBatchProps) {
    if (!props.id) throw new Error('id must be defined');
    this.id = props.id;
  }

  getId(): number {
    return this.id;
  }

  getCount(): number {
    return this.props.count;
  }

  getCostPricePerUnit(): number {
    return this.props.costPricePerUnit;
  }

  toObject() {
    return { id: this.id, ...this.props };
  }

  public static create(props: ProductBatchProps): ProductBatch {
    const productBatch = new ProductBatch(props);

    const event: ProductBatchCreatedEvent = {
      type: ProductBatchEventType.ProductBatchCreated,
      data: productBatch.toObject(),
    };

    // productBatch.applyEvent(event);
    productBatch.events.push(event);

    return productBatch;
  }

  public static createFromSources(data: {
    id: number;
    count: number;
    productId: number;
    statusId: number | null;
    groupId: number | null;
    sources: { qty: number; productBatch: ProductBatch }[];
  }) {
    const productBatch = ProductBatch.create({
      id: data.id,
      count: data.count,
      productId: data.id,
      costPricePerUnit: data.sources.reduce(
        (prev, cur) => prev + cur.productBatch.getCostPricePerUnit() * cur.qty,
        0,
      ),
      exchangeRate: null,
      operationsPrice: 0,
      operationsPricePerUnit: 0,
      currencyCostPricePerUnit: 0,
      statusId: data.statusId,
      groupId: data.groupId,
      sourceIds: data.sources.map(item => item.productBatch.id),
    });
  }

  public createChild(data: ProductBatchChildCreatedEventData): ProductBatch {
    const child = ProductBatch.create({
      ...this.props,
      ...data,
      sourceIds: [this.id],
      count: data.count * data.qty,
    });

    const event: ProductBatchChildCreatedEvent = {
      type: ProductBatchEventType.ProductBatchChildCreated,
      data,
    };
    this.events.push(event);
    this.applyEvent(event);

    return child;
  }

  public static buildFromEvents(events: ProductBatchEvent[]) {
    if (events.length === 0) throw new Error('not found');

    const productBatch = new ProductBatch(
      events[0].data as ProductBatchCreatedEventData,
    );

    events.forEach(event => {
      productBatch.applyEvent(event);
    });

    return productBatch;
  }

  private applyEvent(event: ProductBatchEvent) {
    switch (event.type) {
      case ProductBatchEventType.ProductBatchCreated:
        this.props = event.data;
        break;
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
      default:
        throw new Error('unknown eventType');
    }
  }

  getUncommittedEvents(): ProductBatchEvent[] {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }

  changeStatus(statusId: number) {
    const event: ProductBatchEditedEvent = {
      type: ProductBatchEventType.ProductBatchEdited,
      data: { statusId },
    };

    this.applyEvent(event);
    this.events.push(event);

    return this;
  }
}
