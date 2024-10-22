import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { GroupOperationReadEntity } from '@/operation/group-operation.read-entity.js';
import { ProductBatchGroupEventEntity } from '@/product-batch-group/domain/product-batch-group.event-entity.js';
import {
  type ProductBatchGroupEvent,
  ProductBatchGroupEventType,
} from '@/product-batch-group/domain/product-batch-group.events.js';
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

  async saveEvent({
    events,
    requestId,
  }: {
    events: (ProductBatchGroupEvent & {
      aggregateId: number | null;
      revision: number | null;
    })[];
    requestId: string;
  }) {
    const savedEvents = await this.save(
      events.map(item => {
        const eventEntity = new ProductBatchGroupEventEntity();
        eventEntity.id = item.id;
        eventEntity.requestId = requestId;
        eventEntity.aggregateId = item.aggregateId;
        eventEntity.type = item.type;
        eventEntity.revision = item.aggregateId;
        eventEntity.data = item.data;
        eventEntity.metadata = item.metadata;
        return eventEntity;
      }),
    );

    const groupOperationReadEntities: GroupOperationReadEntity[] = [];

    events.forEach(event => {
      switch (event.type) {
        case ProductBatchGroupEventType.GroupOperationAdded: {
          const groupOperationReadEntity = new GroupOperationReadEntity();
          Object.assign(groupOperationReadEntity, event.data);
          groupOperationReadEntities.push(groupOperationReadEntity);
          break;
        }
        case ProductBatchGroupEventType.Rollback: {
          break;
        }
      }
    });

    await this.manager.save(
      GroupOperationReadEntity,
      groupOperationReadEntities,
    );
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
