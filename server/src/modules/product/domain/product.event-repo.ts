import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ProductEventEntity } from '@/product/domain/product.event-entity.js';
import type { Product } from '@/product/domain/product.js';

export class ProductEventRepo extends Repository<ProductEventEntity> {
  async saveUncommittedEvents({
    aggregates,
    requestId,
  }: {
    aggregates: Product[];
    requestId: string;
  }) {
    const events = await this.save(
      aggregates.flatMap(aggregate =>
        aggregate.getUncommittedEvents().map(item => {
          const event = new ProductEventEntity();
          event.id = item.id;
          event.requestId = requestId;
          event.aggregateId = aggregate.getId();
          event.type = item.type;
          event.revision = item.revision;
          event.data = item.data;
          event.metadata = item.metadata ?? null;
          event.rollbackTargetId = item.rollbackTargetId ?? null;

          return event;
        }),
      ),
    );
    aggregates.forEach(aggregate => {
      aggregate.commitEvents();
    });
    return events;
  }

  async findManyByAggregateId(
    aggregateIds: number[],
  ): Promise<Map<number, ProductEventEntity[]>> {
    const rows = await this.find({
      where: { aggregateId: In(aggregateIds) },
      order: { revision: 'ASC' },
    });
    const map = new Map<number, ProductEventEntity[]>();
    rows.forEach(row =>
      map.set(Number(row.aggregateId), [
        ...(map.get(row.aggregateId) || []),
        row,
      ]),
    );
    return map;
  }

  async findByAggregateId(aggregateId: number): Promise<ProductEventEntity[]> {
    return this.find({
      where: { aggregateId },
      order: { createdAt: 'ASC' },
    });
  }
}

export const ProductEventRepositoryProvider = {
  provide: ProductEventRepo,
  inject: [getRepositoryToken(ProductEventEntity)],
  useFactory: (repository: Repository<ProductEventEntity>) => {
    return new ProductEventRepo(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
