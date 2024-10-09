import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  RelationId,
} from 'typeorm';

import { ProductEntity } from '@/product/domain/product.entity.js';

@Entity({ name: 'product_set_closure' })
export class ProductSetClosureEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @ManyToOne(() => ProductEntity)
  set: Relation<ProductEntity>;

  @RelationId((entity: ProductSetClosureEntity) => entity.set)
  @Column()
  setId: number;

  @ManyToOne(() => ProductEntity)
  product: Relation<ProductEntity>;

  @RelationId((entity: ProductSetClosureEntity) => entity.product)
  @Column()
  productId: number;

  @Column()
  qty: number;
}
