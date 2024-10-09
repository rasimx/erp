import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { StatusRepository } from '@/status/domain/status.repository.js';
import { GetStatusListQuery } from '@/status/queries/get-status-list/get-status-list.query.js';

@QueryHandler(GetStatusListQuery)
export class GetStatusListHandler implements IQueryHandler<GetStatusListQuery> {
  constructor(private readonly statusRepository: StatusRepository) {}

  async execute(query: GetStatusListQuery) {
    return this.statusRepository.statusList(query.ids);
  }
}
