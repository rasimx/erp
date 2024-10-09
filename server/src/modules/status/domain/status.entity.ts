import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { StatusType } from '@/status/dtos/status.dto.js';

@Entity({ name: 'status' })
export class StatusEntity {
  @PrimaryColumn()
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
