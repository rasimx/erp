import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ProductBatchDto } from '@/product-batch/dtos/product-batch.dto.js';
import { StatusDto } from '@/status/dtos/status.dto.js';

@ObjectType()
export class ProductBatchGroupDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  statusId: number;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  order: number;

  @Field(() => StatusDto)
  status: StatusDto;

  @Field(() => [ProductBatchDto])
  productBatchList: ProductBatchDto[];
}

@ObjectType()
export class CommandResponse {
  @Field(() => Boolean)
  success: boolean;
}
