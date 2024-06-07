import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import type {
  CreateOperationInput,
  CreateOperationResponse,
  IMutation,
  IQuery,
  OperationList,
} from '@/graphql.schema.js';

import { OperationService } from './operation.service.js';

@Resolver()
export class OperationResolver implements Pick<IQuery, 'operationList'> {
  constructor(private readonly service: OperationService) {}

  @Query('operationList')
  async operationList(
    @Args('productBatchId') productBatchId: number,
  ): Promise<OperationList> {
    return this.service.operationList(productBatchId);
  }
}
