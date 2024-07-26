import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetStatusListQuery } from '@/status/queries/impl/get-status-list.query.js';
import { StatusRepository } from '@/status/status.repository.js';

@QueryHandler(GetStatusListQuery)
export class GetStatusListHandler implements IQueryHandler<GetStatusListQuery> {
  constructor(private readonly statusRepository: StatusRepository) {}

  async execute(query: GetStatusListQuery) {
    return this.statusRepository.statusList(query.ids);
  }
}
