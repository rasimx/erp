import { UseInterceptors } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
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
    return this.service.createStatus({ title });
  }
  // @Mutation('deleteStatus')
  // async deleteStatus(@Args('id') id: number): Promise<StatusDto[]> {
  //   return this.service.deleteStatus(id);
  // }
  @Mutation(() => [StatusDto])
  async moveStatus(
    @Args('dto', { type: () => MoveStatusDto }) dto: MoveStatusDto,
  ): Promise<StatusDto[]> {
    return this.service.moveStatus(dto);
  }
}
