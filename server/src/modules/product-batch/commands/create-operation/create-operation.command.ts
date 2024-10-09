import type { ICommand } from '@nestjs/cqrs';

import type { CreateOperationDto } from '../../dtos/create-operation.dto.js';

export class CreateOperationCommand implements ICommand {
  constructor(public readonly dto: CreateOperationDto) {}
}
