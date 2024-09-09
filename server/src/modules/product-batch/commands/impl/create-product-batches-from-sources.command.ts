import type { ICommand } from '@nestjs/cqrs';

import type { CreateProductBatchesFromSourcesDto } from '@/product-batch/dtos/create-product-batches-from-sources.dto.js';

export class CreateProductBatchesFromSourcesCommand implements ICommand {
  constructor(public readonly dto: CreateProductBatchesFromSourcesDto) {}
}
