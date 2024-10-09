import { UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { MoveStatusCommand } from '@/status/commands/move-status/move-status.command.js';
import { CreateStatusDto } from '@/status/dtos/create-status.dto.js';
import { MoveStatusDto } from '@/status/dtos/move-status.dto.js';
import { StatusDto } from '@/status/dtos/status.dto.js';
import { GetStatusListQuery } from '@/status/queries/get-status-list/get-status-list.query.js';
import { StatusService } from '@/status/status.service.js';

import { GetStatusQuery } from './queries/get-status/get-status.query.js';

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
    @Args('dto', { type: () => CreateStatusDto }) dto: CreateStatusDto,
  ): Promise<StatusDto[]> {
    return this.service.createStatus(dto);
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
