import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchEventEntity } from '@/product-batch/domain/product-batch-event.entity.js';

export class ProductBatchEventRepository extends Repository<ProductBatchEventEntity> {
  async saveAggregateEvents({
    aggregates,
    eventId,
  }: {
    aggregates: ProductBatch[];
    eventId: string;
  }) {
    await this.save(
      aggregates.flatMap(aggregate =>
        aggregate.getUncommittedEvents().map(item => {
          const event = new ProductBatchEventEntity();
          event.eventId = eventId;
          event.aggregateId = aggregate.getId();
          event.type = item.type;
          event.revision = 0;
          event.data = item.data;

          return event;
        }),
      ),
    );
    aggregates.forEach(aggregate => {
      aggregate.clearEvents();
    });
  }

  async getAllEvents(aggregateId: number): Promise<ProductBatchEventEntity[]> {
    return this.find({ where: { aggregateId }, order: { createdAt: 'ASC' } });
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
