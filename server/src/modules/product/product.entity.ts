import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ProductSetClosureEntity } from '@/product/product-set-closure.entity.js';
import { ProductBatchOperationEntity } from '@/product-batch-operation/product-batch-operation.entity.js';

@Entity({ name: 'product' })
@Unique(['sku'])
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @Column()
  name: string;

  @Column()
  sku: string;

  @Column()
  width: number; // в мм

  @Column()
  height: number; // в мм

  @Column()
  length: number; // в мм

  @Column()
  weight: number; // в граммах

  @OneToMany(() => ProductSetClosureEntity, entity => entity.set)
  setItems: ProductSetClosureEntity[];

  @OneToMany(() => ProductSetClosureEntity, entity => entity.product)
  inSets: ProductSetClosureEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedDate: Date | null;

  get volume(): number {
    // объем в литрах
    const a =
      (((this.width * this.height * this.length) / 1000_000) * 100) / 100;

    return a;
  }
}

export type ProductInsertEntity = Pick<
  ProductEntity,
  'name' | 'sku' | 'width' | 'height' | 'length' | 'weight'
>;
