import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductRepository } from '@/product/domain/product.repository.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchRepository } from '@/product-batch/domain/product-batch.repository.js';
import { ProductBatchEventRepository } from '@/product-batch/domain/product-batch-event.repository.js';
import { GetProductBatchQuery } from '@/product-batch/queries/impl/get-product-batch.query.js';

import type { RevisionProductBatchEvent } from '../../domain/product-batch.events.js';

@QueryHandler(GetProductBatchQuery)
export class GetProductBatchHandler
  implements IQueryHandler<GetProductBatchQuery>
{
  constructor(
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchEventRepo: ProductBatchEventRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  async execute({ id }: GetProductBatchQuery) {
    const events = await this.productBatchEventRepo.findByAggregateId(id);

    const batch = ProductBatch.buildFromEvents(
      events as RevisionProductBatchEvent[],
    );

    const product = await this.productRepo.findOneOrFail({
      where: { id: batch.getProductId() },
    });

    return {
      ...batch.toObject(),
      events,
      volume: 0,
      weight: 0,
      operations: [],
      product,
      // operations: batch.productBatchOperations.map(item => ({
      //   ...item,
      //   name: item.operation.name,
      //   date: item.operation.date,
      //   proportionType: item.operation.proportionType,
      //   createdAt: item.operation.createdAt,
      // })),
    };
  }
}
