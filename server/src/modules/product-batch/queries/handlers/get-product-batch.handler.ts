import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductBatchEventStore } from '@/product-batch/product-batch.eventstore.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { GetProductBatchQuery } from '@/product-batch/queries/impl/get-product-batch.query.js';

@QueryHandler(GetProductBatchQuery)
export class GetProductBatchHandler
  implements IQueryHandler<GetProductBatchQuery>
{
  constructor(
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
  ) {}

  async execute({ id }: GetProductBatchQuery) {
    const batch = await this.productBatchRepository.findOneOrFail({
      where: { id },
      relations: [
        'product',
        'group',
        'status',
        'productBatchOperations',
        'productBatchOperations.operation',
      ],
    });

    const events = await this.productBatchEventStore.getEvents(id);

    return {
      ...batch,
      events,
      volume: batch.volume,
      weight: batch.weight,
      operations: batch.productBatchOperations.map(item => ({
        ...item,
        name: item.operation.name,
        date: item.operation.date,
        proportionType: item.operation.proportionType,
        createdAt: item.operation.createdAt,
      })),
    };
  }
}
