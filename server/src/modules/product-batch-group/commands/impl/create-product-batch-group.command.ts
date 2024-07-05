import type { ICommand } from '@nestjs/cqrs';

import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';

export class CreateProductBatchGroupCommand implements ICommand {
  constructor(public readonly dto: CreateProductBatchGroupDto) {}
}
