import type { ICommand } from '@nestjs/cqrs';

export class DeleteProductBatchCommand implements ICommand {
  constructor(public readonly id: number) {}
}
