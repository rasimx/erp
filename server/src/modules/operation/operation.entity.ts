import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

import { GroupOperationEntity } from '@/operation/group-operation.entity.js';
import { ProductBatchReadEntity } from '@/product-batch/domain/product-batch.read-entity.js';

@Entity({ name: 'operation_read' })
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

  @Column('integer', { nullable: true })
  currencyCost: number | null;

  @Column('integer', { nullable: true })
  exchangeRate: number | null;

  @Column()
  date: string;

  @Column({ type: 'float', default: 100 })
  proportion: number;

  @ManyToOne(() => ProductBatchReadEntity)
  productBatch: Relation<ProductBatchReadEntity>;

  @RelationId((entity: OperationEntity) => entity.productBatch)
  @Column()
  productBatchId: number;

  @ManyToOne(() => GroupOperationEntity, { cascade: ['insert'] })
  groupOperation: Relation<GroupOperationEntity>;

  @RelationId((entity: OperationEntity) => entity.groupOperation)
  @Column({
    type: 'integer',
    nullable: true,
  })
  groupOperationId: number | null;

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
