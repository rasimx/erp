import { UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import type {
  CreateProductBatchInput,
  ProductBatch,
  UpdateProductBatchInput,
} from '@/graphql.schema.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';

@Resolver()
@UseInterceptors(UserInterceptor)
export class ProductBatchResolver {
  constructor(private readonly service: ProductBatchService) {}

  @Query('productBatchList')
  async productBatchList(
    @Args('productId') productId: number,
  ): Promise<ProductBatch[]> {
    return this.service.productBatchList(productId);
  }

  @Mutation('updateProductBatch')
  async updateProductBatch(
    @Args('input') input: UpdateProductBatchInput,
  ): Promise<ProductBatch[]> {
    return this.service.updateProductBatch(input);
  }

  @Mutation('createProductBatch')
  async createProductBatch(
    @Args('input') input: CreateProductBatchInput,
  ): Promise<ProductBatch[]> {
    return this.service.createProductBatch(input);
  }

  @Mutation('deleteProductBatch')
  async deleteProductBatch(@Args('id') id: number): Promise<number> {
    return this.service.deleteProductBatch(id);
  }
}
