import { Aggregate, Ok, type Result } from '@type-ddd/core';

import type { ProductBatchGroupProps } from '@/product-batch-group/domain/product-batch-group.interfaces.js';

import {
  type ProductBatchGroupCreatedEvent,
  type ProductBatchGroupCreatedEventData,
  type ProductBatchGroupEvent,
  ProductBatchGroupEventType,
} from './product-batch-group.events.js';

export class ProductBatchGroup {
  readonly id: number;
  private events: ProductBatchGroupEvent[] = [];
  private constructor(private props: ProductBatchGroupProps) {
    // super(props);
  }

  getId(): number {
    return this.id;
  }
  toObject() {
    return { id: this.id, ...this.props };
  }

  public static create(props: ProductBatchGroupProps): ProductBatchGroup {
    const productBatchGroup = new ProductBatchGroup(props);

    const event: ProductBatchGroupCreatedEvent = {
      type: ProductBatchGroupEventType.ProductBatchGroupCreated,
      data: productBatchGroup.toObject(),
    };

    // productBatch.applyEvent(event);
    productBatchGroup.events.push(event);

    return productBatchGroup;
  }

  public static buildFromEvents(events: ProductBatchGroupEvent[]) {
    if (events.length === 0) throw new Error('not found');

    const productBatch = new ProductBatchGroup(
      events[0].data as ProductBatchGroupCreatedEventData,
    );

    events.forEach(event => {
      productBatch.applyEvent(event);
    });

    return productBatch;
  }

  private applyEvent(event: ProductBatchGroupEvent) {
    switch (event.type) {
      case ProductBatchGroupEventType.ProductBatchGroupCreated:
        this.props = event.data;
        break;
      case ProductBatchGroupEventType.ProductBatchGroupMoved:
        this.props.statusId = event.data.statusId;

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

  getUncommittedEvents(): ProductBatchGroupEvent[] {
    return this.events;
  }

  clearEvents() {
    this.events = [];
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
