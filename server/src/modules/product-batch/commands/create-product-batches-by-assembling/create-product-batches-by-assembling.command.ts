import type { ICommand } from '@nestjs/cqrs';

import type { CreateProductBatchesByAssemblingDto } from '@/product-batch/dtos/create-product-batches-by-assembling.dto.js';

export class CreateProductBatchesByAssemblingCommand implements ICommand {
  constructor(public readonly dto: CreateProductBatchesByAssemblingDto) {}
}
