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
import { StatusEventType } from '@/status/domain/status.events.js';

@Entity({ name: 'status_event' })
@Unique(['aggregateId', 'revision'])
export class StatusEventEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @ManyToOne(() => RequestEntity)
  @JoinColumn()
  request: Relation<RequestEntity>;

  @RelationId((entity: StatusEventEntity) => entity.request)
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
    enum: StatusEventType,
  })
  type: StatusEventType;

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

  @OneToOne(() => StatusEventEntity, entity => entity.rollbackTarget)
  rollback: Relation<StatusEventEntity> | null;

  @OneToOne(() => StatusEventEntity)
  @JoinColumn()
  rollbackTarget: StatusEventEntity | null;

  @RelationId((entity: StatusEventEntity) => entity.rollbackTarget)
  @Column({ type: 'uuid', nullable: true })
  rollbackTargetId: string | null;
}
