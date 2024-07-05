import type { ICommand } from '@nestjs/cqrs';

import type { CreateProductBatchDto } from '@/product-batch/dtos/create-product-batch.dto.js';

export class CreateOperationCommand implements ICommand {
  constructor(public readonly dto: CreateProductBatchDto) {}
}
