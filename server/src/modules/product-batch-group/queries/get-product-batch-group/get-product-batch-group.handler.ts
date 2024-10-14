import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetProductBatchGroupQuery } from '@/product-batch-group/queries/get-product-batch-group/get-product-batch-group.query.js';

import { ProductBatchGroupReadRepo } from '../../domain/product-batch-group.read-repo.js';

@QueryHandler(GetProductBatchGroupQuery)
export class GetProductBatchGroupHandler
  implements IQueryHandler<GetProductBatchGroupQuery>
{
  constructor(
    private readonly productBatchGroupRepository: ProductBatchGroupReadRepo,
  ) {}

  async execute(query: GetProductBatchGroupQuery) {
    const entity = await this.productBatchGroupRepository.findById(query.id);

    try {
      // const events = await this.productBatchGroupEventStore.getEvents(query.id);
      return { ...entity, events: [] };
    } catch (e) {
      // todo: add logging
      throw e;
    }
  }
}
