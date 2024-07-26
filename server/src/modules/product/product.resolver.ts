import { UseInterceptors } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { CreateProductDto } from '@/product/dtos/create-product.dto.js';
import { ProductDto } from '@/product/dtos/product.dto.js';
import { ProductListDto } from '@/product/dtos/product-list.dto.js';

import { ProductService } from './product.service.js';

@Resolver('productList')
@UseInterceptors(UserInterceptor)
export class ProductResolver {
  constructor(private readonly service: ProductService) {}

  @Query(() => ProductListDto)
  async productList(
    @Args('ids', { type: () => [Int], nullable: true, defaultValue: [] })
    ids: number[],
  ): Promise<ProductListDto> {
    return this.service.productList(ids);
  }
  @Mutation(() => ProductDto)
  async createProduct(
    @Args('input', { type: () => CreateProductDto }) dto: CreateProductDto,
  ): Promise<void> {
    // return this.service.createProduct(dto);
  }
}
