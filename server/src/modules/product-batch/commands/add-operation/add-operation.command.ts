import type { ICommand } from '@nestjs/cqrs';

import type { AddOperationDto } from '../../dtos/add-operation.dto.js';

export class AddOperationCommand implements ICommand {
  constructor(public readonly dto: AddOperationDto) {}
}
