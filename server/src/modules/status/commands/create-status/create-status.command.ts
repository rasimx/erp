import type { ICommand } from '@nestjs/cqrs';

import type { CreateStatusDto } from '@/status/dtos/create-status.dto.js';

export class CreateStatusCommand implements ICommand {
  constructor(public readonly dto: CreateStatusDto) {}
}
