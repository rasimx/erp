import {
  ProductBatchEventType,
  type ProductBatchMovedEvent,
  type ProductBatchMovedEventData,
} from '@/product-batch/domain/product-batch.events.js';
import type { ProductBatchGroupProps } from '@/product-batch-group/domain/product-batch-group.interfaces.js';

import {
  type ProductBatchGroupCreatedEvent,
  type ProductBatchGroupCreatedEventData,
  type ProductBatchGroupEvent,
  ProductBatchGroupEventType,
  type ProductBatchGroupMovedEvent,
  type ProductBatchGroupMovedEventData,
  type RevisionProductBatchGroupEvent,
} from './product-batch-group.events.js';

export class ProductBatchGroup {
  readonly id: number;
  private revision: number;
  private events: RevisionProductBatchGroupEvent[] = [];
  private constructor(private props: ProductBatchGroupProps) {
    if (!props.id) throw new Error('id must be defined');
    this.id = props.id;
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

    productBatchGroup.revision = 0;
    productBatchGroup.events.push({
      ...event,
      revision: productBatchGroup.revision,
    });

    return productBatchGroup;
  }

  public static buildFromEvents(events: RevisionProductBatchGroupEvent[]) {
    const zeroEvent = events.shift();

    if (!zeroEvent) throw new Error('not found');

    const group = new ProductBatchGroup(
      zeroEvent.data as ProductBatchGroupCreatedEventData,
    );

    group.revision = zeroEvent.revision;

    events.forEach(event => {
      group.applyEvent(event);
      group.revision = event.revision;
    });

    return group;
  }

  private appendEvent(event: ProductBatchGroupEvent): void {
    ++this.revision;
    this.events.push({ ...event, revision: this.revision });
    if (event.type !== ProductBatchGroupEventType.ProductBatchGroupCreated) {
      this.applyEvent(event);
    }
  }

  private applyEvent(event: ProductBatchGroupEvent) {
    switch (event.type) {
      case ProductBatchGroupEventType.ProductBatchGroupCreated:
        this.props = event.data;
        break;
      case ProductBatchGroupEventType.ProductBatchGroupMoved:
        if (event.data.statusId) {
          this.props.statusId = event.data.statusId;
        }
        if (event.data.order) {
          this.props.order = event.data.order;
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

  getUncommittedEvents(): RevisionProductBatchGroupEvent[] {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }

  public move(eventData: ProductBatchGroupMovedEventData): void {
    let valid = false;
    const data: ProductBatchGroupMovedEventData = { order: eventData.order };
    if (this.props.order !== eventData.order) {
      valid = true;
    }
    if (this.props.statusId !== eventData.statusId) {
      valid = true;
      data.statusId = eventData.statusId;
    }

    if (valid) {
      const event: ProductBatchGroupMovedEvent = {
        type: ProductBatchGroupEventType.ProductBatchGroupMoved,
        data,
      };
      this.appendEvent(event);
    }
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
