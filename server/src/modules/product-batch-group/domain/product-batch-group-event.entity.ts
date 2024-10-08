import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
  RelationId,
  Unique,
} from 'typeorm';

import { ProductBatchGroupEventType } from '@/product-batch-group/domain/product-batch-group.events.js';
import { RequestEntity } from '@/request/request.entity.js';

@Entity({ name: 'product_batch_group_event' })
@Unique(['aggregateId', 'revision'])
export class ProductBatchGroupEventEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @ManyToOne(() => RequestEntity)
  @JoinColumn()
  request: Relation<RequestEntity>;

  @RelationId((entity: ProductBatchGroupEventEntity) => entity.request)
  @Column({ type: 'uuid' })
  requestId: string;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @Column()
  revision: number;

  @Column()
  aggregateId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: ProductBatchGroupEventType,
  })
  type: ProductBatchGroupEventType;

  @Column({
    type: 'jsonb',
  })
  public data: unknown;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  public metadata: unknown;
}
