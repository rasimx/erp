import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  RelationId,
} from 'typeorm';

import { ProductBatchReadEntity } from '@/product-batch/domain/product-batch.read-entity.js';

@Entity({ name: 'product_batch_closure' })
export class ProductBatchClosureEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductBatchReadEntity)
  public source: Relation<ProductBatchReadEntity>;

  @Column()
  @RelationId((entity: ProductBatchClosureEntity) => entity.source)
  public sourceId: string;

  @ManyToOne(() => ProductBatchReadEntity)
  public destination: Relation<ProductBatchReadEntity>;

  @Column()
  @RelationId((entity: ProductBatchClosureEntity) => entity.destination)
  public destinationId: string;

  @Column()
  count: number;

  @Column({ default: 1 })
  qty: number;
}
