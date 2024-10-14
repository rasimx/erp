import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductBatchGroupReadRepo } from '../../domain/product-batch-group.read-repo.js';
import { GetProductBatchGroupListQuery } from './get-product-batch-group-list.query.js';

@QueryHandler(GetProductBatchGroupListQuery)
export class GetProductBatchGroupListHandler
  implements IQueryHandler<GetProductBatchGroupListQuery>
{
  constructor(
    private readonly productBatchGroupRepository: ProductBatchGroupReadRepo,
  ) {}

  async execute(query: GetProductBatchGroupListQuery) {
    return this.productBatchGroupRepository.findItems(query.dto);
  }
}
