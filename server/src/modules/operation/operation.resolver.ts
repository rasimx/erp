import { UseInterceptors } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import type { IQuery, OperationList } from '@/graphql.schema.js';

import { OperationService } from './operation.service.js';

@Resolver()
@UseInterceptors(UserInterceptor)
export class OperationResolver implements Pick<IQuery, 'operationList'> {
  constructor(private readonly service: OperationService) {}

  @Query('operationList')
  async operationList(
    @Args('productBatchId') productBatchId: number,
  ): Promise<OperationList> {
    return this.service.operationList(productBatchId);
  }
}
