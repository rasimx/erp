import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'product' })
@Unique(['sku'])
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedDate: Date | null;

  get volume(): number {
    // объем в литрах
    return (
      Math.floor(((this.width * this.height * this.length) / 1000_000) * 100) /
      100
    );
  }
}

export type ProductInsertEntity = Pick<
  ProductEntity,
  'name' | 'sku' | 'width' | 'height' | 'length' | 'weight'
>;
