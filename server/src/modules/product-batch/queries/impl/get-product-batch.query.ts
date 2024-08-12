import type { IQuery } from '@nestjs/cqrs';

export class GetProductBatchQuery implements IQuery {
  constructor(public readonly id: number) {}
}
