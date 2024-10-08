import type { ICommand } from '@nestjs/cqrs';

import type { CreateProductBatchesFromSourcesListDto } from '@/product-batch/dtos/create-product-batches-from-sources-list.dto.js';

export class CreateProductBatchesFromSourcesCommand implements ICommand {
  constructor(public readonly dto: CreateProductBatchesFromSourcesListDto) {}
}
