import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchGroupRepository } from '@/product-batch/product-batch-group.repository.js';
import { GetProductBatchGroupListQuery } from '@/product-batch/queries/impl/get-product-batch-group-list.query.js';

@QueryHandler(GetProductBatchGroupListQuery)
export class GetProductBatchListHandler
  implements IQueryHandler<GetProductBatchGroupListQuery>
{
  constructor(
    @InjectRepository(ProductBatchEntity)
    private readonly productBatchRepository: ProductBatchGroupRepository,
  ) {}

  async execute(query: GetProductBatchGroupListQuery) {
    return this.productBatchRepository.find({ relations: ['product'] });
  }
}
