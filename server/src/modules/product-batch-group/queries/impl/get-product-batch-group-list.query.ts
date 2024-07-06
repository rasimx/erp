import type { IQuery } from '@nestjs/cqrs';

export class GetProductBatchGroupListQuery implements IQuery {
  constructor(public readonly productId?: number | null) {}
}
