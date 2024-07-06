import { UseInterceptors } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';

import { CreateProductBatchGroupDto } from './dtos/create-product-batch-group.dto.js';
import { MoveProductBatchGroupDto } from './dtos/move-product-batch-group.dto.js';
import { ProductBatchGroupDto } from './dtos/product-batch-group.dto.js';
import { ProductBatchGroupService } from './product-batch-group.service.js';

@Resolver()
@UseInterceptors(UserInterceptor)
export class ProductBatchGroupResolver {
  constructor(private readonly service: ProductBatchGroupService) {}

  @Query(() => [ProductBatchGroupDto])
  async productBatchGroupList(
    @Args('productId', { type: () => Int, nullable: true })
    productId: number | null,
  ): Promise<ProductBatchGroupDto[]> {
    return this.service.productBatchGroupList(productId);
  }
  //
  // @Mutation('updateProductBatch')
  // async updateProductBatch(
  //   @Args('input') input: UpdateProductBatchInput,
  // ): Promise<ProductBatch[]> {
  //   return this.service.updateProductBatch(input);
  // }

  @Mutation(() => [ProductBatchGroupDto])
  async createProductBatchGroup(
    @Args('dto', { type: () => CreateProductBatchGroupDto })
    dto: CreateProductBatchGroupDto,
  ): Promise<ProductBatchGroupDto[]> {
    return this.service.createProductBatchGroup(dto);
  }

  @Mutation(() => [ProductBatchGroupDto])
  async moveProductBatchGroup(
    @Args('dto', { type: () => MoveProductBatchGroupDto })
    dto: MoveProductBatchGroupDto,
  ): Promise<ProductBatchGroupDto[]> {
    return this.service.moveProductBatchGroup(dto);
  }

  @Mutation(() => Int)
  async deleteProductBatchGroup(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<void> {
    return this.service.deleteProductBatchGroup(id);
  }
}
