import { Field, Float, InputType, Int } from '@nestjs/graphql';

import { ProportionType } from '@/operation/dtos/operation.dto.js';

@InputType()
export class ProductBatchOperationDto {
  @Field(() => Int)
  productBatchId: number;

  @Field(() => Float)
  proportion: number;

  @Field(() => Int)
  cost: number;
}

@InputType()
export class AddGroupOperationDto {
  @Field(() => String)
  name: string;

  @Field(() => Int)
  cost: number;

  @Field(() => Int, { nullable: true, defaultValue: null })
  currencyCost: number | null;

  @Field(() => Int, { nullable: true, defaultValue: null })
  exchangeRate: number | null;

  @Field(() => Int, { nullable: true, defaultValue: null })
  groupId: number | null;

  @Field(() => String)
  date: string;

  @Field(() => ProportionType, {
    nullable: true,
    defaultValue: ProportionType.equal,
  })
  proportionType: ProportionType;

  @Field(() => [ProductBatchOperationDto])
  items: ProductBatchOperationDto[];
}
