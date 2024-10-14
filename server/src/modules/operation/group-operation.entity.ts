import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ProportionType } from '@/operation/dtos/operation.dto.js';
import { OperationEntity } from '@/operation/operation.entity.js';

@Entity({ name: 'group_operation_read' })
export class GroupOperationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @Column({
    type: 'integer',
    nullable: true,
  })
  groupId: number | null;

  @Column()
  name: string;

  @Column()
  cost: number;

  @Column('integer', { nullable: true })
  currencyCost: number | null;

  @Column('integer', { nullable: true })
  exchangeRate: number | null;

  @Column()
  date: string;

  @Column({
    type: 'enum',
    enum: ProportionType,
    default: ProportionType.equal,
  })
  proportionType: ProportionType;

  @OneToMany(() => OperationEntity, entity => entity.groupOperation, {
    cascade: ['insert'],
  })
  operations: OperationEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedDate: Date | null;
}
