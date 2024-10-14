import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductReadRepo } from '@/product/domain/product.read-repo.js';

import { GetProductSetListQuery } from './get-product-set-list.query.js';

@QueryHandler(GetProductSetListQuery)
export class GetProductSetListHandler
  implements IQueryHandler<GetProductSetListQuery>
{
  constructor(private readonly productRepo: ProductReadRepo) {}

  async execute(query: GetProductSetListQuery) {
    return this.productRepo.productSetList();
  }
}
