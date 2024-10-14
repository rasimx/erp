import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { StatusReadRepo } from '@/status/domain/status.read-repo.js';
import { GetStatusListQuery } from '@/status/queries/get-status-list/get-status-list.query.js';

@QueryHandler(GetStatusListQuery)
export class GetStatusListHandler implements IQueryHandler<GetStatusListQuery> {
  constructor(private readonly statusRepository: StatusReadRepo) {}

  async execute(query: GetStatusListQuery) {
    return this.statusRepository.statusList(query.ids);
  }
}
