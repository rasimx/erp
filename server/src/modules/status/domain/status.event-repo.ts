import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { StatusEventEntity } from '@/status/domain/status.event-entity.js';
import type { Status } from '@/status/domain/status.js';

export class StatusEventRepo extends Repository<StatusEventEntity> {
  async saveUncommittedEvents({
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
  provide: StatusEventRepo,
  inject: [getRepositoryToken(StatusEventEntity)],
  useFactory: (repository: Repository<StatusEventEntity>) => {
    return new StatusEventRepo(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
