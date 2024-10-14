import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductReadRepo } from '@/product/domain/product.read-repo.js';
import { GetProductListQuery } from '@/product/queries/get-product-list/get-product-list.query.js';

@QueryHandler(GetProductListQuery)
export class GetProductListHandler
  implements IQueryHandler<GetProductListQuery>
{
  constructor(private readonly productRepo: ProductReadRepo) {}

  async execute({ ids }: GetProductListQuery) {
    return this.productRepo.productList(ids);
  }
}
