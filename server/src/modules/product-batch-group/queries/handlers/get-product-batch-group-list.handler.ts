import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { ProductBatchGroupEntity } from '../../product-batch-group.entity.js';
import { ProductBatchGroupRepository } from '../../product-batch-group.repository.js';
import { GetProductBatchGroupListQuery } from '../impl/get-product-batch-group-list.query.js';

@QueryHandler(GetProductBatchGroupListQuery)
export class GetProductBatchGroupListHandler
  implements IQueryHandler<GetProductBatchGroupListQuery>
{
  constructor(
    @InjectRepository(ProductBatchGroupEntity)
    private readonly productBatchRepository: ProductBatchGroupRepository,
  ) {}

  async execute(query: GetProductBatchGroupListQuery) {
    return this.productBatchRepository.find({
      relations: ['productBatchList', 'status'],
    });
  }
}
