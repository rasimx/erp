import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateStatusCommand } from '@/status/commands/impl/create-status.command.js';
import type { CreateStatusDto } from '@/status/dtos/create-status.dto.js';
import type { StatusDto } from '@/status/dtos/status.dto.js';
import { GetStatusListQuery } from '@/status/queries/impl/get-status-list.query.js';
import { StatusRepository } from '@/status/status.repository.js';

@Injectable()
export class StatusService {
  constructor(
    private readonly statusRepository: StatusRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  async createStatus(dto: CreateStatusDto): Promise<StatusDto[]> {
    await this.commandBus.execute(new CreateStatusCommand(dto));
    return this.queryBus.execute(new GetStatusListQuery([]));
  }
}
