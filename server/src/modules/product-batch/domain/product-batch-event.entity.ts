import { Column, Entity, Unique } from 'typeorm';

import { BaseEvent } from '@/event-store2/base-event.js';
import { ProductBatchEventType } from '@/product-batch/domain/product-batch.events.js';

@Entity({ name: 'product_batch_event' })
@Unique(['aggregateId', 'revision'])
export class ProductBatchEventEntity extends BaseEvent {
  @Column({
    type: 'enum',
    enum: ProductBatchEventType,
  })
  type: ProductBatchEventType;

  @Column({
    type: 'jsonb',
  })
  public data: unknown;
}
