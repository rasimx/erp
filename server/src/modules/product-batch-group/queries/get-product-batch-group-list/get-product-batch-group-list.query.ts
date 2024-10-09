import type { IQuery } from '@nestjs/cqrs';

import type { GetProductBatchListDto } from '@/product-batch/dtos/get-product-batch-list.dto.js';

export class GetProductBatchGroupListQuery implements IQuery {
  constructor(public readonly dto: GetProductBatchListDto) {}
}
