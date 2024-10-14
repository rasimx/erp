import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  type Relation,
  RelationId,
} from 'typeorm';

import { ProductBatchReadEntity } from '@/product-batch/domain/product-batch.read-entity.js';
import { StatusReadEntity } from '@/status/domain/status.read-entity.js';

@Entity({ name: 'product_batch_group_read' })
export class ProductBatchGroupReadEntity {
  @PrimaryColumn()
  id: number;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @Column()
  name: string;

  @ManyToOne(() => StatusReadEntity)
  @JoinColumn()
  status: Relation<StatusReadEntity>;

  @RelationId((entity: ProductBatchGroupReadEntity) => entity.status)
  @Column()
  statusId: number;

  @Column()
  order: number;

  @OneToMany(() => ProductBatchReadEntity, entity => entity.group)
  productBatchList: ProductBatchReadEntity[];

  @DeleteDateColumn({ nullable: true })
  deletedDate: Date | null;

  @Column()
  revision: number;
}
