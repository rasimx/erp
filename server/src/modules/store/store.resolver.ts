import { UseInterceptors } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import type { Store } from '@/graphql.schema.js';
import { StoreService } from '@/store/store.service.js';

@Resolver()
@UseInterceptors(UserInterceptor)
export class StoreResolver {
  constructor(private readonly storeService: StoreService) {}

  @Query('storeState')
  async storeState(
    @Args('productId') productId: number | undefined,
    @Args('statusId') statusId: number | undefined,
  ): Promise<Store[]> {
    return this.storeService.storeState({ productId, statusId });
  }
}
