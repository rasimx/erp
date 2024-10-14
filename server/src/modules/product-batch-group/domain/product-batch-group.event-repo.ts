import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ProductBatchGroupEventEntity } from '@/product-batch-group/domain/product-batch-group.event-entity.js';
import type { ProductBatchGroup } from '@/product-batch-group/domain/product-batch-group.js';

export class ProductBatchGroupEventRepo extends Repository<ProductBatchGroupEventEntity> {
  async saveUncommittedEvents({
    aggregates,
    requestId,
  }: {
    aggregates: ProductBatchGroup[];
    requestId: string;
  }) {
    const events = await this.save(
      aggregates.flatMap(aggregate =>
        aggregate.getUncommittedEvents().map(item => {
          const event = new ProductBatchGroupEventEntity();
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
  ): Promise<Map<number, ProductBatchGroupEventEntity[]>> {
    const rows = await this.find({
      where: { aggregateId: In(aggregateIds) },
      order: { revision: 'ASC' },
    });
    const map = new Map<number, ProductBatchGroupEventEntity[]>();
    rows.forEach(row =>
      map.set(row.aggregateId as number, [
        ...(map.get(row.aggregateId as number) || []),
        row,
      ]),
    );
    return map;
  }

  async findByAggregateId(
    aggregateId: number,
  ): Promise<ProductBatchGroupEventEntity[]> {
    return this.find({
      where: { aggregateId },
      order: { revision: 'ASC' },
    });
  }
}

export const ProductBatchGroupEventRepositoryProvider = {
  provide: ProductBatchGroupEventRepo,
  inject: [getRepositoryToken(ProductBatchGroupEventEntity)],
  useFactory: (repository: Repository<ProductBatchGroupEventEntity>) => {
    return new ProductBatchGroupEventRepo(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
