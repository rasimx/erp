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
  Tree,
  TreeChildren,
  TreeParent,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ProductEntity } from '@/product/product.entity.js';
import { ProductBatchOperationEntity } from '@/product-batch-operation/product-batch-operation.entity.js';
import { StatusEntity } from '@/status/status.entity.js';

@Entity({ name: 'product_batch' })
@Tree('closure-table', {
  closureTableName: 'product_batch',
  ancestorColumnName: column => 'ancestor_' + column.propertyName,
  descendantColumnName: column => 'descendant_' + column.propertyName,
})
export class ProductBatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @Column()
  name: string;

  @ManyToOne(() => ProductEntity, { cascade: ['insert'] })
  @JoinColumn()
  product: Relation<ProductEntity>;

  @RelationId((entity: ProductBatchEntity) => entity.product)
  @Column()
  productId: number;

  @ManyToOne(() => StatusEntity, { cascade: ['insert'] })
  @JoinColumn()
  status: Relation<StatusEntity>;

  @RelationId((entity: ProductBatchEntity) => entity.status)
  @Column()
  statusId: number;

  @Column()
  order: number;

  @TreeChildren()
  children: ProductBatchEntity[];

  @TreeParent()
  parent: ProductBatchEntity | null;

  @Column({ nullable: true })
  parentId: number | null;

  @Column()
  count: number;

  @Column({ default: false })
  countUpdated: boolean;

  @Column()
  costPrice: number;

  @Column('date')
  date: string;

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

export type ProductBatchEntityForInsert = Pick<
  ProductBatchEntity,
  'productId' | 'statusId' | 'count' | 'costPrice' | 'date'
>;
