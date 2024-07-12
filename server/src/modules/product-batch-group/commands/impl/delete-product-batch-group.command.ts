import type { ICommand } from '@nestjs/cqrs';

export class DeleteProductBatchGroupCommand implements ICommand {
  constructor(public readonly id: number) {}
}
