import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  type Relation,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

import { ProductReadEntity } from '@/product/domain/product.read-entity.js';
import { ProductBatchClosureEntity } from '@/product-batch/product-batch-closure.entity.js';
import { ProductBatchGroupReadEntity } from '@/product-batch-group/domain/product-batch-group.read-entity.js';
import { ProductBatchOperationEntity } from '@/product-batch-operation/product-batch-operation.entity.js';
import { StatusReadEntity } from '@/status/domain/status.read-entity.js';

@Entity({ name: 'product_batch_read' })
export class ProductBatchReadEntity {
  @PrimaryColumn()
  id: number;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @ManyToOne(() => ProductReadEntity)
  @JoinColumn()
  product: Relation<ProductReadEntity>;

  @RelationId((entity: ProductBatchReadEntity) => entity.product)
  @Column()
  productId: number;

  @ManyToOne(() => StatusReadEntity)
  @JoinColumn()
  status: Relation<StatusReadEntity> | null;

  @RelationId((entity: ProductBatchReadEntity) => entity.status)
  @Column('integer', { nullable: true })
  statusId: number | null;

  @Column()
  order: number;

  @OneToMany(() => ProductBatchClosureEntity, entity => entity.source)
  destinationsClosure: ProductBatchClosureEntity[];

  @OneToMany(() => ProductBatchClosureEntity, entity => entity.destination)
  sourcesClosure: ProductBatchClosureEntity[];

  @ManyToOne(() => ProductBatchGroupReadEntity)
  @JoinColumn()
  group: Relation<ProductBatchGroupReadEntity> | null;

  @RelationId((entity: ProductBatchReadEntity) => entity.group)
  @Column('integer', { nullable: true })
  groupId: number | null;

  @Column()
  count: number;

  @Column()
  initialCount: number;

  @Column({ default: false })
  countUpdated: boolean;

  @Column()
  costPricePerUnit: number;

  @Column('integer', { nullable: true })
  currencyCostPricePerUnit: number | null;

  @Column('integer', { nullable: true })
  exchangeRate: number | null;

  @Column()
  operationsPricePerUnit: number;

  @Column()
  operationsPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedDate: Date | null;

  @Column()
  revision: number;

  @OneToMany(() => ProductBatchOperationEntity, entity => entity.productBatch)
  productBatchOperations: ProductBatchOperationEntity[];

  @Column({ default: false })
  shouldSplit: boolean;

  @Column('float')
  volume: number;

  @Column()
  weight: number;
}
