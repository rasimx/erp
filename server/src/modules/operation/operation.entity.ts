import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ProportionType } from '@/graphql.schema.js';
import { ProductBatchOperationEntity } from '@/product-batch-operation/product-batch-operation.entity.js';

@Entity({ name: 'operation' })
export class OperationEntity {
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

  @Column()
  date: string;

  @Column({
    type: 'enum',
    enum: ProportionType,
    default: ProportionType.equal,
  })
  proportionType: ProportionType;

  @OneToMany(() => ProductBatchOperationEntity, entity => entity.operation)
  productBatchOperations: ProductBatchOperationEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedDate: Date | null;
}

export type OperationInsertEntity = Pick<
  OperationEntity,
  'name' | 'cost' | 'date'
>;
