import type { ICommand } from '@nestjs/cqrs';

import type { EditProductBatchDto } from '@/product-batch/dtos/edit-product-batch.dto.js';

export class EditProductBatchCommand implements ICommand {
  constructor(public readonly dto: EditProductBatchDto) {}
}
