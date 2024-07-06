import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ProductDto } from '@/product/dtos/product.dto.js';
import { StatusDto } from '@/status/dtos/status.dto.js';

@ObjectType()
export class ProductBatchDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  count: number;

  @Field(() => Int, { nullable: true })
  statusId: number | null;

  @Field(() => Int)
  productId: number;

  @Field(() => String)
  date: string;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  costPricePerUnit: number;

  @Field(() => Int)
  operationsPricePerUnit: number;

  @Field(() => Int)
  order: number;

  @Field(() => ProductDto)
  product: ProductDto;

  @Field(() => StatusDto, { nullable: true })
  status: StatusDto | null;

  @Field(() => Int, { nullable: true })
  parentId?: number | null;
}
