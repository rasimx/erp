import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { StatusRepository } from '@/status/status.repository.js';

@Injectable()
export class StatusService {
  constructor(
    private readonly statusRepository: StatusRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}
}
