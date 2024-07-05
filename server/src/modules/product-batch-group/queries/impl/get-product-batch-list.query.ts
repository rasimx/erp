import type { IQuery } from '@nestjs/cqrs';

export class GetProductBatchListQuery implements IQuery {
  constructor(public readonly productId?: number | null) {}
}
