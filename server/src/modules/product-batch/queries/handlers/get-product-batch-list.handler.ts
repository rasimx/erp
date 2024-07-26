import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { GetProductBatchListQuery } from '@/product-batch/queries/impl/get-product-batch-list.query.js';

@QueryHandler(GetProductBatchListQuery)
export class GetProductBatchListHandler
  implements IQueryHandler<GetProductBatchListQuery>
{
  constructor(
    private readonly productBatchRepository: ProductBatchRepository,
  ) {}

  async execute(query: GetProductBatchListQuery) {
    return this.productBatchRepository.productBatchList(query.dto);
  }
}
