import type { IQuery } from '@nestjs/cqrs';

export class GetStatusQuery implements IQuery {
  constructor(readonly id: number) {}
}
