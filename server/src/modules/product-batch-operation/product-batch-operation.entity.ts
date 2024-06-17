import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  RelationId,
} from 'typeorm';

import { OperationEntity } from '@/operation/operation.entity.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';

@Entity({ name: 'product_batch_operation' })
export class ProductBatchOperationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @Column('float')
  proportion: number;

  @Column()
  cost: number;

  @ManyToOne(() => ProductBatchEntity)
  productBatch: Relation<ProductBatchEntity>;

  @RelationId((entity: ProductBatchOperationEntity) => entity.productBatch)
  @Column()
  productBatchId: number;

  @ManyToOne(() => OperationEntity, { cascade: ['insert'] })
  operation: Relation<OperationEntity>;

  @RelationId((entity: ProductBatchOperationEntity) => entity.operation)
  @Column()
  operationId: number;
}
