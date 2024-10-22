import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  type Relation,
  RelationId,
  Unique,
} from 'typeorm';

import { ProductEventType } from '@/product/domain/product.events.js';
import { RequestEntity } from '@/request/request.entity.js';

@Entity({ name: 'product_event' })
@Unique(['aggregateId', 'revision'])
export class ProductEventEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @ManyToOne(() => RequestEntity)
  @JoinColumn()
  request: Relation<RequestEntity>;

  @RelationId((entity: ProductEventEntity) => entity.request)
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
    enum: ProductEventType,
  })
  type: ProductEventType;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  public data: unknown;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  public metadata: unknown;

  @OneToOne(() => ProductEventEntity, entity => entity.rollbackTarget)
  rollback: Relation<ProductEventEntity> | null;

  @OneToOne(() => ProductEventEntity)
  @JoinColumn()
  rollbackTarget: ProductEventEntity | null;

  @RelationId((entity: ProductEventEntity) => entity.rollbackTarget)
  @Column({ type: 'uuid', nullable: true })
  rollbackTargetId: string | null;
}
