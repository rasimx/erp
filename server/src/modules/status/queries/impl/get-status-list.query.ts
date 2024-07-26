import type { IQuery } from '@nestjs/cqrs';

export class GetStatusListQuery implements IQuery {
  constructor(readonly ids: number[]) {}
}
