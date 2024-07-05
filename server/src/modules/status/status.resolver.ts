import { UseInterceptors } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { MoveStatusDto } from '@/status/dtos/move-status.dto.js';
import { StatusDto } from '@/status/dtos/status.dto.js';
import { StatusService } from '@/status/status.service.js';

@Resolver()
@UseInterceptors(UserInterceptor)
export class StatusResolver {
  constructor(private readonly service: StatusService) {}

  @Query(() => [StatusDto])
  async statusList(): Promise<StatusDto[]> {
    return this.service.statusList();
  }
  @Mutation(() => [StatusDto])
  async createStatus(@Args('title') title: string): Promise<StatusDto[]> {
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
