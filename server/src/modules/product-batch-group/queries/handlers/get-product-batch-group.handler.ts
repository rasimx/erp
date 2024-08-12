import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductBatchGroupEventStore } from '@/product-batch-group/prodict-batch-group.eventstore.js';
import { GetProductBatchGroupQuery } from '@/product-batch-group/queries/impl/get-product-batch-group.query.js';

import { ProductBatchGroupRepository } from '../../product-batch-group.repository.js';

@QueryHandler(GetProductBatchGroupQuery)
export class GetProductBatchGroupHandler
  implements IQueryHandler<GetProductBatchGroupQuery>
{
  constructor(
    private readonly productBatchGroupRepository: ProductBatchGroupRepository,
    private readonly productBatchGroupEventStore: ProductBatchGroupEventStore,
  ) {}

  async execute(query: GetProductBatchGroupQuery) {
    const entity = await this.productBatchGroupRepository.findById(query.id);

    const events = await this.productBatchGroupEventStore.getEvents(query.id);

    return { ...entity, events };
  }
}
