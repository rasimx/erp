import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  RelationId,
} from 'typeorm';

import { RequestEntity } from '@/request/request.entity.js';
import { StatusEntity } from '@/status/status.entity.js';

// @Entity({ name: 'event' })
export class BaseEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  eventId: string;

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
}
