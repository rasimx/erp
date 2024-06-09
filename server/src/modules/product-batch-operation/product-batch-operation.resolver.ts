import { UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import type {
  CreateOperationInput,
  CreateOperationResponse,
  IMutation,
} from '@/graphql.schema.js';

import { ProductBatchOperationService } from './product-batch-operation.service.js';

@Resolver()
@UseInterceptors(UserInterceptor)
export class ProductBatchOperationResolver
  implements Pick<IMutation, 'createOperation'>
{
  constructor(private readonly service: ProductBatchOperationService) {}

  @Mutation('createOperation')
  async createOperation(
    @Args('input') input: CreateOperationInput,
  ): Promise<CreateOperationResponse> {
    return this.service.createOperation(input);
  }
}
