import { UseInterceptors } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { CreateProductDto } from '@/product/dtos/create-product.dto.js';
import { ProductDto } from '@/product/dtos/product.dto.js';
import { ProductListDto } from '@/product/dtos/product-list.dto.js';
import { GetProductListQuery } from '@/product/queries/get-product-list/get-product-list.query.js';

import { ProductService } from './product.service.js';
import { GetProductSetListQuery } from './queries/get-product-set-list/get-product-set-list.query.js';

@Resolver('productList')
@UseInterceptors(UserInterceptor)
export class ProductResolver {
  constructor(
    private readonly service: ProductService,
    private queryBus: QueryBus,
  ) {}

  @Query(() => ProductListDto)
  async productList(
    @Args('ids', { type: () => [Int], nullable: true, defaultValue: [] })
    ids: number[],
  ): Promise<ProductListDto> {
    return this.queryBus.execute(new GetProductListQuery(ids));
  }

  @Query(() => ProductListDto)
  async productSetList(): Promise<ProductListDto> {
    return this.queryBus.execute(new GetProductSetListQuery());
  }

  @Mutation(() => ProductDto)
  async createProduct(
    @Args('input', { type: () => CreateProductDto }) dto: CreateProductDto,
  ): Promise<void> {
    // return this.service.createProduct(dto);
  }
}
