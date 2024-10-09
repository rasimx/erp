import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import type { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchEventEntity } from '@/product-batch/domain/product-batch-event.entity.js';

export class ProductBatchEventRepository extends Repository<ProductBatchEventEntity> {
  async saveAggregateEvents({
    aggregates,
    requestId,
  }: {
    aggregates: ProductBatch[];
    requestId: string;
  }): Promise<ProductBatchEventEntity[]> {
    const events = await this.save(
      aggregates.flatMap(aggregate =>
        aggregate.getUncommittedEvents().map(item => {
          const event = new ProductBatchEventEntity();
          event.id = item.id;
          event.requestId = requestId;
          event.aggregateId = aggregate.getId();
          event.type = item.type;
          event.revision = item.revision;
          event.data = item.data;
          event.metadata = item.metadata ?? null;

          return event;
        }),
      ),
    );
    aggregates.forEach(aggregate => {
      aggregate.clearEvents();
    });
    return events;
  }

  async findManyByAggregateId(
    aggregateIds: number[],
  ): Promise<Map<number, ProductBatchEventEntity[]>> {
    const rows = await this.find({
      where: { aggregateId: In(aggregateIds) },
      order: { revision: 'ASC' },
    });
    const map = new Map<number, ProductBatchEventEntity[]>();
    rows.forEach(row =>
      map.set(Number(row.aggregateId), [
        ...(map.get(row.aggregateId) || []),
        row,
      ]),
    );
    return map;
  }

  async findByAggregateId(
    aggregateId: number,
  ): Promise<ProductBatchEventEntity[]> {
    return this.find({
      where: { aggregateId },
      order: { createdAt: 'ASC' },
    });
  }
}

export const ProductBatchEventRepositoryProvider = {
  provide: ProductBatchEventRepository,
  inject: [getRepositoryToken(ProductBatchEventEntity)],
  useFactory: (repository: Repository<ProductBatchEventEntity>) => {
    return new ProductBatchEventRepository(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};