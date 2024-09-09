import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  RelationId,
} from 'typeorm';

import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';

@Entity({ name: 'product_batch_closure' })
export class ProductBatchClosureEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductBatchEntity)
  public source: Relation<ProductBatchEntity>;

  @Column()
  @RelationId((entity: ProductBatchClosureEntity) => entity.source)
  public sourceId: number;

  @ManyToOne(() => ProductBatchEntity)
  public destination: Relation<ProductBatchEntity>;

  @Column()
  @RelationId((entity: ProductBatchClosureEntity) => entity.destination)
  public destinationId: number;

  @Column()
  count: number;

  @Column()
  qty: number;
}
