import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import type { Status } from '@/graphql.schema.js';
import { StatusService } from '@/status/status.service.js';

@Resolver()
export class StatusResolver {
  constructor(private readonly service: StatusService) {}

  @Query('statusList')
  async stateList(): Promise<Status[]> {
    return this.service.statusList();
  }
  @Mutation('createStatus')
  async createStatus(@Args('title') title: string): Promise<Status[]> {
    return this.service.createStatus(title);
  }
  @Mutation('deleteStatus')
  async deleteStatus(@Args('id') id: number): Promise<Status[]> {
    return this.service.deleteStatus(id);
  }
}
