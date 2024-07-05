import type { ICommand } from '@nestjs/cqrs';

import type { MoveProductBatchGroupDto } from '@/product-batch-group/dtos/move-product-batch-group.dto.js';

export class MoveProductBatchGroupCommand implements ICommand {
  constructor(public readonly dto: MoveProductBatchGroupDto) {}
}
