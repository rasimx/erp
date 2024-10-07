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

import { ProductBatchEventType } from '@/product-batch/domain/product-batch.events.js';
import { RequestEntity } from '@/request/request.entity.js';

@Entity({ name: 'product_batch_event' })
@Unique(['aggregateId', 'revision'])
export class ProductBatchEventEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @ManyToOne(() => RequestEntity)
  @JoinColumn()
  request: Relation<RequestEntity>;

  @RelationId((entity: ProductBatchEventEntity) => entity.request)
  @Column({ type: 'uuid' })
  requestId: string;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @Column()
  revision: number;

  @Column({ type: 'bigint' })
  aggregateId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: ProductBatchEventType,
  })
  type: ProductBatchEventType;

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
