import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  RelationId,
} from 'typeorm';

import { ProductBatchEntity } from '@/product-batch/domain/product-batch.entity.js';

@Entity({ name: 'product_batch_closure' })
export class ProductBatchClosureEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductBatchEntity)
  public source: Relation<ProductBatchEntity>;

  @Column()
  @RelationId((entity: ProductBatchClosureEntity) => entity.source)
  public sourceId: string;

  @ManyToOne(() => ProductBatchEntity)
  public destination: Relation<ProductBatchEntity>;

  @Column()
  @RelationId((entity: ProductBatchClosureEntity) => entity.destination)
  public destinationId: string;

  @Column()
  count: number;

  @Column({ default: 1 })
  qty: number;
}
