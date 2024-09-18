import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { AtLeast } from '@/common/helpers/utils.js';
import { StatusType } from '@/status/dtos/status.dto.js';

@Entity({ name: 'status' })
export class StatusEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @Column('integer', { nullable: true })
  storeId: number | null;

  @Column({
    type: 'enum',
    enum: StatusType,
    default: StatusType.custom,
  })
  type: StatusType;

  @Column()
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedDate: Date | null;
}

export type StatusInsertEntity = AtLeast<StatusEntity, 'title'>;
export type StatusByStoreEntity = StatusEntity & { storeId: number };
