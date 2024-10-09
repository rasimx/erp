import type { ICommand } from '@nestjs/cqrs';

import type { AddGroupOperationDto } from '../../dtos/add-group-operation.dto.js';

export class AddGroupOperationCommand implements ICommand {
  constructor(public readonly dto: AddGroupOperationDto) {}
}
