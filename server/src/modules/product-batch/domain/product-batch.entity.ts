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

import { ProductEntity } from '@/product/domain/product.entity.js';
import { ProductBatchClosureEntity } from '@/product-batch/product-batch-closure.entity.js';
import { ProductBatchGroupEntity } from '@/product-batch-group/domain/product-batch-group.entity.js';
import { ProductBatchOperationEntity } from '@/product-batch-operation/product-batch-operation.entity.js';
import { StatusEntity } from '@/status/domain/status.entity.js';

@Entity({ name: 'product_batch' })
export class ProductBatchEntity {
  @PrimaryColumn()
  id: number;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @ManyToOne(() => ProductEntity)
  @JoinColumn()
  product: Relation<ProductEntity>;

  @RelationId((entity: ProductBatchEntity) => entity.product)
  @Column()
  productId: number;

  @ManyToOne(() => StatusEntity)
  @JoinColumn()
  status: Relation<StatusEntity> | null;

  @RelationId((entity: ProductBatchEntity) => entity.status)
  @Column('integer', { nullable: true })
  statusId: number | null;

  @Column()
  order: number;

  @OneToMany(() => ProductBatchClosureEntity, entity => entity.source)
  destinationsClosure: ProductBatchClosureEntity[];

  @OneToMany(() => ProductBatchClosureEntity, entity => entity.destination)
  sourcesClosure: ProductBatchClosureEntity[];

  @ManyToOne(() => ProductBatchGroupEntity)
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

  get volume(): number {
    // объем в литрах
    return this.product.volume * this.count;
  }
  get weight(): number {
    // объем в литрах
    return this.product.weight * this.count;
  }
}
