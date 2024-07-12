import type { ICommand } from '@nestjs/cqrs';

import type { CreateProductBatchDto } from '@/product-batch/dtos/create-product-batch.dto.js';

export class CreateProductBatchCommand implements ICommand {
  constructor(
    public readonly dto: CreateProductBatchDto,
    public readonly statusId: number | null,
    public readonly groupId: number | null,
  ) {}
}
