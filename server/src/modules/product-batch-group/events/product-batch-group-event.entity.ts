import { Column, Entity, Unique } from 'typeorm';

import { BaseEvent } from '@/event-store2/base-event.js';
import { ProductBatchGroupEventType } from '@/product-batch-group/domain/product-batch-group.events.js';

@Entity({ name: 'product_batch_group_event' })
@Unique(['aggregateId', 'revision'])
export class ProductBatchGroupEventEntity extends BaseEvent {
  @Column({
    type: 'enum',
    enum: ProductBatchGroupEventType,
  })
  type: ProductBatchGroupEventType;

  @Column({
    type: 'jsonb',
  })
  public data: unknown;
}
