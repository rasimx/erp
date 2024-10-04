import type { ICommand } from '@nestjs/cqrs';

import type { CreateProductBatchListDto } from '@/product-batch/dtos/create-product-batch-list.dto.js';

export class CreateProductBatchCommand implements ICommand {
  constructor(public readonly dto: CreateProductBatchListDto) {}
}
