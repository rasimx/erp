import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { StatusRepository } from '@/status/status.repository.js';

import { GetStatusQuery } from '../impl/get-status.query.js';

@QueryHandler(GetStatusQuery)
export class GetStatusHandler implements IQueryHandler<GetStatusQuery> {
  constructor(private readonly statusRepository: StatusRepository) {}

  async execute(query: GetStatusQuery) {
    return this.statusRepository.findOneOrFail({ where: { id: query.id } });
  }
}
