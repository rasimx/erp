import type { ICommand } from '@nestjs/cqrs';

import type { CreateGroupOperationDto } from '../../dtos/create-group-operation.dto.js';

export class CreateGroupOperationCommand implements ICommand {
  constructor(public readonly dto: CreateGroupOperationDto) {}
}
