import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

import { ProductBatchOperationEntity } from '@/product-batch-operation/product-batch-operation.entity.js';
import { ProportionType } from '@/graphql.schema.js';

@Entity({ name: 'operation' })
export class OperationEntity {
  @PrimaryGeneratedColumn()
  id: number;

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
