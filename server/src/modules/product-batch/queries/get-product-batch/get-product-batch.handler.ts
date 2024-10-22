import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductReadRepo } from '@/product/domain/product.read-repo.js';
import { ProductBatchEventRepo } from '@/product-batch/domain/product-batch.event-repo.js';
import { ProductBatchReadRepo } from '@/product-batch/domain/product-batch.read-repo.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { GetProductBatchQuery } from '@/product-batch/queries/get-product-batch/get-product-batch.query.js';

import {
  ProductBatchEventType,
  type ProductBatchRollbackEvent,
} from '../../domain/product-batch.events.js';

@QueryHandler(GetProductBatchQuery)
export class GetProductBatchHandler
  implements IQueryHandler<GetProductBatchQuery>
{
  constructor(
    private readonly productBatchRepository: ProductBatchReadRepo,
    private readonly productBatchEventRepo: ProductBatchEventRepo,
    private readonly productRepo: ProductReadRepo,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute({ id }: GetProductBatchQuery) {
    const events = await this.productBatchEventRepo.findByAggregateId(id);

    const rollbackEventIds = events
      .filter(event => event.type == ProductBatchEventType.Rollback)
      .map(item => (item as ProductBatchRollbackEvent).rollbackTargetId);

    const nonRolledBackEvents = events.filter(
      event =>
        !rollbackEventIds.includes(event.id) &&
        event.type != ProductBatchEventType.Rollback,
    );

    const batch = await this.productBatchService.getReadModel({ id });

    // const product = await this.productRepo.findOneOrFail({
    //   where: { id: batch.getProductId() },
    // });

    return {
      ...batch.toObject(),
      events: nonRolledBackEvents,
      volume: 0,
      weight: 0,
      operations: [],
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
