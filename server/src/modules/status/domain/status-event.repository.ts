import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import type { Status } from '@/status/domain/status.js';
import { StatusEventEntity } from '@/status/domain/status-event.entity.js';

export class StatusEventRepository extends Repository<StatusEventEntity> {
  async saveAggregateEvents({
    aggregates,
    requestId,
  }: {
    aggregates: Status[];
    requestId: string;
  }) {
    const events = await this.save(
      aggregates.flatMap(aggregate =>
        aggregate.getUncommittedEvents().map(item => {
          const event = new StatusEventEntity();
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
  ): Promise<Map<number, StatusEventEntity[]>> {
    const rows = await this.find({
      where: { aggregateId: In(aggregateIds) },
      order: { revision: 'ASC' },
    });
    const map = new Map<number, StatusEventEntity[]>();
    rows.forEach(row =>
      map.set(Number(row.aggregateId), [
        ...(map.get(row.aggregateId) || []),
        row,
      ]),
    );
    return map;
  }

  async findByAggregateId(aggregateId: number): Promise<StatusEventEntity[]> {
    return this.find({
      where: { aggregateId },
      order: { createdAt: 'ASC' },
    });
  }
}

export const StatusEventRepositoryProvider = {
  provide: StatusEventRepository,
  inject: [getRepositoryToken(StatusEventEntity)],
  useFactory: (repository: Repository<StatusEventEntity>) => {
    return new StatusEventRepository(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
