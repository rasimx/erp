import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductBatchGroupRepository } from '../../product-batch-group.repository.js';
import { GetProductBatchGroupListQuery } from '../impl/get-product-batch-group-list.query.js';

@QueryHandler(GetProductBatchGroupListQuery)
export class GetProductBatchGroupListHandler
  implements IQueryHandler<GetProductBatchGroupListQuery>
{
  constructor(
    private readonly productBatchGroupRepository: ProductBatchGroupRepository,
  ) {}

  async execute(query: GetProductBatchGroupListQuery) {
    return this.productBatchGroupRepository.findItems(query.dto);
  }
}
