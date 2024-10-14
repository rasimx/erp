import { UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Mutation, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { CommandResponse } from '@/product-batch-group/dtos/product-batch-group.dto.js';
import { RevertCommand } from '@/request/commands/revert/revert.command.js';
import { RollbackCommand } from '@/request/commands/rollback/rollback.command.js';

@Resolver()
@UseInterceptors(UserInterceptor)
export class RequestResolver {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Mutation(() => CommandResponse)
  async rollback(): Promise<CommandResponse> {
    await this.commandBus.execute(new RollbackCommand());
    return { success: true };
  }
  @Mutation(() => CommandResponse)
  async revert(): Promise<CommandResponse> {
    await this.commandBus.execute(new RevertCommand());
    return { success: true };
  }
}
