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

import { ProductBatchEntity } from '@/product-batch/domain/product-batch.entity.js';
import { StatusEntity } from '@/status/domain/status.entity.js';

@Entity({ name: 'product_batch_group' })
export class ProductBatchGroupEntity {
  @PrimaryColumn()
  id: number;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @Column()
  name: string;

  @ManyToOne(() => StatusEntity)
  @JoinColumn()
  status: Relation<StatusEntity>;

  @RelationId((entity: ProductBatchGroupEntity) => entity.status)
  @Column()
  statusId: number;

  @Column()
  order: number;

  @OneToMany(() => ProductBatchEntity, entity => entity.group)
  productBatchList: ProductBatchEntity[];

  @DeleteDateColumn({ nullable: true })
  deletedDate: Date | null;

  @Column()
  revision: number;
}
