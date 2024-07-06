import { UseInterceptors } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { CreateProductBatchDto } from '@/product-batch/dtos/create-product-batch.dto.js';
import { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';
import { ProductBatchDto } from '@/product-batch/dtos/product-batch.dto.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';

@Resolver()
@UseInterceptors(UserInterceptor)
export class ProductBatchResolver {
  constructor(private readonly service: ProductBatchService) {}

  @Query(() => [ProductBatchDto])
  async productBatchList(
    @Args('productId', { type: () => Int, nullable: true })
    productId: number | null,
  ): Promise<ProductBatchDto[]> {
    return this.service.productBatchList(productId);
  }
  //
  // @Mutation('updateProductBatch')
  // async updateProductBatch(
  //   @Args('input') input: UpdateProductBatchInput,
  // ): Promise<ProductBatch[]> {
  //   return this.service.updateProductBatch(input);
  // }

  @Mutation(() => [ProductBatchDto])
  async createProductBatch(
    @Args('dto', { type: () => CreateProductBatchDto })
    dto: CreateProductBatchDto,
  ): Promise<ProductBatchDto[]> {
    return this.service.createProductBatchGroup(dto);
  }

  @Mutation(() => [ProductBatchDto])
  async moveProductBatch(
    @Args('dto', { type: () => MoveProductBatchDto })
    dto: MoveProductBatchDto,
  ): Promise<ProductBatchDto[]> {
    return this.service.moveProductBatchGroup(dto);
  }

  @Mutation(() => Int)
  async deleteProductBatch(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<void> {
    return this.service.deleteProductBatchGroup(id);
  }
}
