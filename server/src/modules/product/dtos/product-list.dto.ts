import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ProductDto } from '@/product/dtos/product.dto.js';

@ObjectType()
export class ProductListDto {
  @Field(() => [ProductDto])
  items: ProductDto[];

  @Field(() => Int)
  totalCount: number; // в граммах
}
