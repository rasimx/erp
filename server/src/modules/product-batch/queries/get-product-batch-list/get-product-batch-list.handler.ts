import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductBatchReadRepo } from '@/product-batch/domain/product-batch.read-repo.js';
import { GetProductBatchListQuery } from '@/product-batch/queries/get-product-batch-list/get-product-batch-list.query.js';

@QueryHandler(GetProductBatchListQuery)
export class GetProductBatchListHandler
  implements IQueryHandler<GetProductBatchListQuery>
{
  constructor(private readonly productBatchRepository: ProductBatchReadRepo) {}

  async execute(query: GetProductBatchListQuery) {
    return this.productBatchRepository.productBatchList(query.dto);
  }
}
