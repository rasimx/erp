import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  RelationId,
} from 'typeorm';

import { ProductReadEntity } from '@/product/domain/product.read-entity.js';

@Entity({ name: 'product_set_closure' })
export class ProductSetClosureEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @ManyToOne(() => ProductReadEntity)
  set: Relation<ProductReadEntity>;

  @RelationId((entity: ProductSetClosureEntity) => entity.set)
  @Column()
  setId: number;

  @ManyToOne(() => ProductReadEntity)
  product: Relation<ProductReadEntity>;

  @RelationId((entity: ProductSetClosureEntity) => entity.product)
  @Column()
  productId: number;

  @Column()
  qty: number;
}
