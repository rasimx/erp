import { UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import type {
  CreateProductInput,
  CreateProductResponse,
  ProductList,
} from '@/graphql.schema.js';

import { ProductService } from './product.service.js';

@Resolver('productList')
@UseInterceptors(UserInterceptor)
export class ProductResolver {
  constructor(private readonly service: ProductService) {}

  @Query('productList')
  async productList(): Promise<ProductList> {
    return this.service.productList();
  }
  @Mutation('createProduct')
  async createProduct(
    @Args('input') input: CreateProductInput,
  ): Promise<CreateProductResponse> {
    return this.service.createProduct(input);
  }
}
