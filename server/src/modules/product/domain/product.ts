import { v7 as uuidV7 } from 'uuid';

import {
  type ProductCreatedEvent,
  type ProductCreatedEventData,
  type ProductEvent,
  ProductEventType,
  type RevisionProductEvent,
} from './product.events.js';
import type { CreateProductProps, ProductProps } from './product.interfaces.js';

export class Product {
  readonly id: number;
  private revision: number;
  private events: RevisionProductEvent[] = [];
  constructor(private props: ProductProps) {
    if (!props.id) throw new Error('id must be defined');
    this.id = Number(props.id);
  }

  public static create(
    props: CreateProductProps,
    metadata?: Record<string, unknown>,
  ): Product {
    const product = new Product({
      ...props,
    });

    const event: ProductCreatedEvent = {
      id: uuidV7(),
      type: ProductEventType.ProductCreated,
      data: product.toObject(),
      metadata,
    };

    product.revision = 0;
    product.events.push({ ...event, revision: product.revision });

    return product;
  }

  public static buildFromEvents(origEvents: RevisionProductEvent[]) {
    const events = [...origEvents].toSorted((a, b) => a.revision - b.revision);
    const zeroEvent = events.shift();

    if (!zeroEvent) throw new Error('not found');

    const productBatch = new Product(zeroEvent.data as ProductCreatedEventData);
    productBatch.revision = zeroEvent.revision;

    events.forEach(event => {
      productBatch.applyEvent(event);
      productBatch.revision = event.revision;
    });

    return productBatch;
  }

  private appendEvent(event: ProductEvent): void {
    this.revision++;
    this.events.push({ ...event, revision: this.revision });
    if (event.type !== ProductEventType.ProductCreated) {
      this.applyEvent(event);
    }
  }

  private applyEvent(event: ProductEvent) {
    switch (event.type) {
      // case ProductBatchEventType.ProductBatchCreated:
      //   this.props = event.data;
      //   break;

      case ProductEventType.ProductArchived:
        // if (event.data.name) {
        //   this.name = event.data.name;
        // }
        // if (event.data.quantity) {
        //   this.quantity = event.data.quantity;
        // }
        break;
      case ProductEventType.ProductEdited:
        this.props.name = event.data.name;

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

  getUncommittedEvents(): RevisionProductEvent[] {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }

  getId(): number {
    return this.id;
  }

  getWeight(): number {
    return this.props.weight;
  }

  getVolume(): number {
    const volume =
      (((this.props.width * this.props.height * this.props.length) / 1000_000) *
        100) /
      100;

    return Number(volume.toFixed(2));
  }

  toObject() {
    return { ...this.props, id: this.id, revision: this.revision };
  }
}
