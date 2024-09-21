import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

import { ProductEntity } from '@/product/product.entity.js';
import { ProductSetClosureEntity } from '@/product/product-set-closure.entity.js';
import { ProductBatchClosureEntity } from '@/product-batch/product-batch-closure.entity.js';
import { ProductBatchGroupEntity } from '@/product-batch-group/product-batch-group.entity.js';
import { ProductBatchOperationEntity } from '@/product-batch-operation/product-batch-operation.entity.js';
import { StatusEntity } from '@/status/status.entity.js';

@Entity({ name: 'product_batch' })
export class ProductBatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @ManyToOne(() => ProductEntity, { cascade: ['insert'] })
  @JoinColumn()
  product: Relation<ProductEntity>;

  @RelationId((entity: ProductBatchEntity) => entity.product)
  @Column()
  productId: number;

  @ManyToOne(() => StatusEntity, { cascade: ['insert'] })
  @JoinColumn()
  status: Relation<StatusEntity> | null;

  @RelationId((entity: ProductBatchEntity) => entity.status)
  @Column('integer', { nullable: true })
  statusId: number | null;

  @Column()
  order: number;

  @ManyToOne(() => ProductBatchEntity, { cascade: ['insert'] })
  @JoinColumn()
  parent: Relation<ProductBatchEntity>;

  @RelationId((entity: ProductBatchEntity) => entity.parent)
  @Column('integer', { nullable: true })
  parentId: number | null;

  @OneToMany(() => ProductBatchClosureEntity, entity => entity.source)
  destinationsClosure: ProductBatchClosureEntity[];

  @OneToMany(() => ProductBatchClosureEntity, entity => entity.destination)
  sourcesClosure: ProductBatchClosureEntity[];

  @ManyToOne(() => ProductBatchGroupEntity, { cascade: ['insert'] })
  @JoinColumn()
  group: Relation<ProductBatchGroupEntity> | null;

  @RelationId((entity: ProductBatchEntity) => entity.group)
  @Column('integer', { nullable: true })
  groupId: number | null;

  @Column()
  count: number;

  @Column({ default: false })
  countUpdated: boolean;

  @Column()
  costPricePerUnit: number;

  @Column('integer', { nullable: true })
  currencyCostPricePerUnit: number;

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

  @OneToMany(() => ProductBatchOperationEntity, entity => entity.productBatch)
  productBatchOperations: ProductBatchOperationEntity[];

  get volume(): number {
    // объем в литрах
    return this.product.volume * this.count;
  }
  get weight(): number {
    // объем в литрах
    return this.product.weight * this.count;
  }
}
