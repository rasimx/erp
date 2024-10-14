import type { IQuery } from '@nestjs/cqrs';

export class GetProductListQuery implements IQuery {
  constructor(public readonly ids: number[]) {}
}
