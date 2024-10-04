import type { ICommand } from '@nestjs/cqrs';

import type { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';

export class MoveProductBatchCommand implements ICommand {
  constructor(public readonly dto: MoveProductBatchDto) {}
}
