import type { IQuery } from '@nestjs/cqrs';

export class GetProductBatchGroupQuery implements IQuery {
  constructor(public readonly id: number) {}
}
