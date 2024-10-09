import type { ICommand } from '@nestjs/cqrs';

import type { MoveStatusDto } from '@/status/dtos/move-status.dto.js';

export class MoveStatusCommand implements ICommand {
  constructor(public readonly dto: MoveStatusDto) {}
}
