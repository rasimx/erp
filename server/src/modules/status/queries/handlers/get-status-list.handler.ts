import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { GetStatusListQuery } from '@/status/queries/impl/get-status-list.query.js';
import { StatusEntity } from '@/status/status.entity.js';
import type { StatusRepository } from '@/status/status.repository.js';

@QueryHandler(GetStatusListQuery)
export class GetStatusListHandler implements IQueryHandler<GetStatusListQuery> {
  constructor(
    @InjectRepository(StatusEntity)
    private readonly statusRepository: StatusRepository,
  ) {}

  async execute(query: GetStatusListQuery) {
    return this.statusRepository.find();
  }
}
