import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { ProductDto } from '@/product/dtos/product.dto.js';
import { ProductBatchGroupDto } from '@/product-batch-group/dtos/product-batch-group.dto.js';
import { StatusDto } from '@/status/dtos/status.dto.js';

@ObjectType()
export class ProductBatchDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  count: number;

  @Field(() => Int, { nullable: true, defaultValue: null })
  statusId: number | null;

  @Field(() => Int, { nullable: true, defaultValue: null })
  groupId: number | null;

  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  costPricePerUnit: number;

  @Field(() => Int)
  operationsPricePerUnit: number;

  @Field(() => Int)
  order: number;

  @Field(() => Float)
  volume: number;

  @Field(() => Int)
  weight: number;

  @Field(() => ProductDto)
  product: ProductDto;

  @Field(() => ProductBatchGroupDto, { nullable: true })
  group: ProductBatchGroupDto | null;

  @Field(() => StatusDto, { nullable: true, defaultValue: null })
  status: StatusDto | null;

  @Field(() => Int, { nullable: true, defaultValue: null })
  parentId?: number | null;
}
