import { UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { CreateStatusCommand } from '@/status/commands/impl/create-status.command.js';
import { MoveStatusCommand } from '@/status/commands/impl/move-status.command.js';
import { MoveStatusDto } from '@/status/dtos/move-status.dto.js';
import { StatusDto } from '@/status/dtos/status.dto.js';
import { GetStatusListQuery } from '@/status/queries/impl/get-status-list.query.js';
import { StatusService } from '@/status/status.service.js';

import { GetStatusQuery } from './queries/impl/get-status.query.js';

@Resolver()
@UseInterceptors(UserInterceptor)
export class StatusResolver {
  constructor(
    private readonly service: StatusService,
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Query(() => [StatusDto])
  async statusList(
    @Args('ids', { type: () => [Int], nullable: true, defaultValue: [] })
    ids: number[],
  ): Promise<StatusDto[]> {
    return this.queryBus.execute(new GetStatusListQuery(ids));
  }

  @Query(() => StatusDto)
  async status(
    @Args('id', { type: () => Int })
    id: number,
  ): Promise<StatusDto> {
    return this.queryBus.execute(new GetStatusQuery(id));
  }

  @Mutation(() => [StatusDto])
  async createStatus(
    @Args('title', { type: () => String }) title: string,
  ): Promise<StatusDto[]> {
    await this.commandBus.execute(new CreateStatusCommand({ title }));
    return this.queryBus.execute(new GetStatusListQuery([]));
  }
  // @Mutation('deleteStatus')
  // async deleteStatus(@Args('id') id: number): Promise<StatusDto[]> {
  //   return this.service.deleteStatus(id);
  // }
  @Mutation(() => [StatusDto])
  async moveStatus(
    @Args('dto', { type: () => MoveStatusDto }) dto: MoveStatusDto,
  ): Promise<StatusDto[]> {
    await this.commandBus.execute(new MoveStatusCommand(dto));
    return this.queryBus.execute(new GetStatusListQuery([]));
  }
}
