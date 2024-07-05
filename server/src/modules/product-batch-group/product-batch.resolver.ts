import { UseInterceptors } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { CreateProductBatchGroupDto } from '@/product-batch/dtos/create-product-batch-group.dto.js';
import { MoveProductBatchGroupDto } from '@/product-batch/dtos/move-product-batch-group.dto.js';
import { ProductBatchGroupDto } from '@/product-batch/dtos/product-batch-group.dto.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';

@Resolver()
@UseInterceptors(UserInterceptor)
export class ProductBatchResolver {
  constructor(private readonly service: ProductBatchService) {}

  @Query(() => [ProductBatchGroupDto])
  async productBatchList(
    @Args('productId', { type: () => Int, nullable: true })
    productId: number | null,
  ): Promise<ProductBatchGroupDto[]> {
    return this.service.productBatchList(productId);
  }
  //
  // @Mutation('updateProductBatch')
  // async updateProductBatch(
  //   @Args('input') input: UpdateProductBatchInput,
  // ): Promise<ProductBatch[]> {
  //   return this.service.updateProductBatch(input);
  // }

  @Mutation(() => [ProductBatchGroupDto])
  async createProductBatch(
    @Args('dto', { type: () => CreateProductBatchGroupDto })
    dto: CreateProductBatchGroupDto,
  ): Promise<ProductBatchGroupDto[]> {
    return this.service.createProductBatch(dto);
  }

  @Mutation(() => [ProductBatchGroupDto])
  async moveProductBatch(
    @Args('dto', { type: () => MoveProductBatchGroupDto })
    dto: MoveProductBatchGroupDto,
  ): Promise<ProductBatchGroupDto[]> {
    return this.service.moveProductBatch(dto);
  }

  @Mutation(() => Int)
  async deleteProductBatch(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<void> {
    return this.service.deleteProductBatch(id);
  }
}
