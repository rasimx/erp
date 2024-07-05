import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  RelationId,
} from 'typeorm';

import { StatusEntity } from '@/status/status.entity.js';

@Entity({ name: 'product_batch_group' })
export class ProductBatchGroupEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @Column()
  name: string;

  @ManyToOne(() => StatusEntity, { cascade: ['insert'] })
  @JoinColumn()
  status: Relation<StatusEntity>;

  @RelationId((entity: ProductBatchGroupEntity) => entity.status)
  @Column()
  statusId: number;

  @Column()
  order: number;
}
