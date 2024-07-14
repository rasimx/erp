import { UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { CreateOperationCommand } from '@/operation/commands/impl/create-operation.command.js';
import { CreateOperationDto } from '@/operation/dtos/create-operation.dto.js';
import { CommandResponse } from '@/product-batch-group/dtos/product-batch-group.dto.js';

import { OperationService } from './operation.service.js';

@Resolver()
@UseInterceptors(UserInterceptor)
export class OperationResolver {
  constructor(
    private readonly service: OperationService,
    private commandBus: CommandBus,
  ) {}

  // @Query()
  // async operationList(
  //   @Args('productBatchId') productBatchId: number,
  // ): Promise<OperationList> {
  //   return this.service.operationList(productBatchId);
  // }

  @Mutation(() => CommandResponse)
  async createOperation(
    @Args('dto', { type: () => CreateOperationDto }) dto: CreateOperationDto,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(new CreateOperationCommand(dto));
    return { success: true };
  }
}
