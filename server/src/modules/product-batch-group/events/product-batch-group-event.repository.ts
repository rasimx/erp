import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { ProductBatchGroup } from '@/product-batch-group/domain/product-batch-group.js';
import { ProductBatchGroupEventEntity } from '@/product-batch-group/events/product-batch-group-event.entity.js';

export class ProductBatchGroupEventRepository extends Repository<ProductBatchGroupEventEntity> {
  async saveAggregateEvents({
    aggregate,
    eventId,
  }: {
    aggregate: ProductBatchGroup;
    eventId: string;
  }) {
    await this.save(
      aggregate.getUncommittedEvents().map(item => {
        const event = new ProductBatchGroupEventEntity();
        event.eventId = eventId;
        event.aggregateId = aggregate.getId();
        event.type = item.type;
        event.revision = 0;
        event.data = item.data;

        return event;
      }),
    );
    aggregate.clearEvents();
  }

  async getAllEvents(
    aggregateId: number,
  ): Promise<ProductBatchGroupEventEntity[]> {
    return this.find({ where: { aggregateId }, order: { createdAt: 'ASC' } });
  }
}

export const ProductBatchGroupEventRepositoryProvider = {
  provide: ProductBatchGroupEventRepository,
  inject: [getRepositoryToken(ProductBatchGroupEventEntity)],
  useFactory: (repository: Repository<ProductBatchGroupEventEntity>) => {
    return new ProductBatchGroupEventRepository(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
