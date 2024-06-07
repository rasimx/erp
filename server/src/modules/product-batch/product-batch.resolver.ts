import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import type {
  CreateProductBatchInput,
  IMutation,
  // MergeProductBatchInput,
  // MergeProductBatchResponse,
  ProductBatch,
  SplitProductBatchInput,
  SplitProductBatchResponse,
  UpdateProductBatchInput,
} from '@/graphql.schema.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';

@Resolver()
export class ProductBatchResolver
  implements Pick<IMutation, 'updateProductBatch'>
{
  constructor(private readonly service: ProductBatchService) {}

  @Query('productBatchList')
  async productBatchList(): Promise<ProductBatch[]> {
    return this.service.productBatchList();
  }

  @Mutation('updateProductBatch')
  async updateProductBatch(
    @Args('input') input: UpdateProductBatchInput,
  ): Promise<ProductBatch> {
    return this.service.updateProductBatch(input);
  }

  @Mutation('createProductBatch')
  async createProductBatch(
    @Args('input') input: CreateProductBatchInput,
  ): Promise<ProductBatch> {
    return this.service.createProductBatch(input);
  }

  @Mutation('deleteProductBatch')
  async deleteProductBatch(@Args('id') id: number): Promise<number> {
    return this.service.deleteProductBatch(id);
  }

  @Mutation('splitProductBatch')
  async splitProductBatch(
    @Args('input') input: SplitProductBatchInput,
  ): Promise<SplitProductBatchResponse> {
    return this.service.splitProductBatch(input);
  }
  // @Mutation('mergeProductBatch')
  // async mergeProductBatch(
  //   @Args('input') input: MergeProductBatchInput,
  // ): Promise<MergeProductBatchResponse> {
  //   return this.service.mergeProductBatch(input);
  // }
}
