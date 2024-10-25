import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ProductSetClosureEntity } from '@/product/domain/product-set-closure.entity.js';

@Entity({ name: 'product_read' })
@Unique(['sku'])
export class ProductReadEntity {
  @PrimaryColumn()
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

  @Column()
  revision: number;

  get volume(): number {
    // объем в литрах
    const a =
      (((this.width * this.height * this.length) / 1000_000) * 100) / 100;

    return a;
  }
}
