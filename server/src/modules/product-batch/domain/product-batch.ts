import type { ProductBatchProps } from '@/product-batch/domain/product-batch.interfaces.js';

import {
  type ProductBatchChildCreatedEvent,
  type ProductBatchChildCreatedEventData,
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
    this.id = props.id;
  }

  public static create(props: ProductBatchProps): ProductBatch {
    const productBatch = new ProductBatch(props);

    const event: ProductBatchCreatedEvent = {
      type: ProductBatchEventType.ProductBatchCreated,
      data: productBatch.toObject(),
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
    sources: { qty: number; productBatch: ProductBatch }[];
  }) {
    // const productBatch = ProductBatch.create({
    //   id: data.id,
    //   count: data.count,
    //   productId: data.id,
    //   costPricePerUnit: data.sources.reduce(
    //     (prev, cur) => prev + cur.productBatch.getCostPricePerUnit() * cur.qty,
    //     0,
    //   ),
    //   exchangeRate: null,
    //   operationsPrice: 0,
    //   operationsPricePerUnit: 0,
    //   currencyCostPricePerUnit: 0,
    //   statusId: data.statusId,
    //   groupId: data.groupId,
    //   sourceIds: data.sources.map(item => item.productBatch.id),
    // });
    // productBatch.revision = 0;
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
    this.appendEvent(event);
    // this.applyEvent(event);

    return child;
  }

  public static buildFromEvents(events: RevisionProductBatchEvent[]) {
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
    return { id: this.id, ...this.props };
  }

  public move(eventData: ProductBatchMovedEventData): void {
    let valid = false;
    const data: ProductBatchMovedEventData = { order: eventData.order };
    if (this.props.order !== eventData.order) {
      valid = true;
    }
    if (this.props.statusId !== eventData.statusId) {
      valid = true;
      data.statusId = eventData.statusId;
    }
    if (this.props.groupId !== eventData.groupId) {
      valid = true;
      data.groupId = eventData.groupId;
    }

    if (valid) {
      const event: ProductBatchMovedEvent = {
        type: ProductBatchEventType.ProductBatchMoved,
        data,
      };
      this.appendEvent(event);
    }
  }

  changeStatus(statusId: number) {
    const event: ProductBatchEditedEvent = {
      type: ProductBatchEventType.ProductBatchEdited,
      data: { statusId },
    };

    this.appendEvent(event);

    return this;
  }
}
