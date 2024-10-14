import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { StatusReadRepo } from '@/status/domain/status.read-repo.js';

import { GetStatusQuery } from './get-status.query.js';

@QueryHandler(GetStatusQuery)
export class GetStatusHandler implements IQueryHandler<GetStatusQuery> {
  constructor(private readonly statusRepository: StatusReadRepo) {}

  async execute(query: GetStatusQuery) {
    return this.statusRepository.findOneOrFail({ where: { id: query.id } });
  }
}
