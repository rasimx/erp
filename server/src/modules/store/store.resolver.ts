import { UseInterceptors } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import type { Store, StoreInput } from '@/graphql.schema.js';
import { StoreService } from '@/store/store.service.js';

@Resolver()
@UseInterceptors(UserInterceptor)
export class StoreResolver {
  constructor(private readonly storeService: StoreService) {}

  @Query('storeState')
  async storeState(
    @Args('productId') productId: number | undefined,
    @Args('storeInput') storeInput: StoreInput | undefined,
  ): Promise<Store[]> {
    return this.storeService.storeState({ productId, storeInput });
  }
}
