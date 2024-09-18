import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Column } from 'typeorm';

@InputType()
export class CreateProductBatchDto {
  @Field(() => Int, { nullable: true, defaultValue: null })
  statusId: number | null;

  @Field(() => Int, { nullable: true, defaultValue: null })
  groupId: number | null;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int)
  count: number;

  @IsNumber()
  @Field(() => Int)
  productId: number;

  @IsNumber()
  @Field(() => Int)
  costPricePerUnit: number;

  @IsNumber()
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  operationsPricePerUnit: number | null;

  @IsNumber()
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  operationsPrice: number | null;

  @Field(() => Int, { nullable: true, defaultValue: null })
  currencyCostPricePerUnit: number | null;

  @Field(() => Int, { nullable: true, defaultValue: null })
  exchangeRate: number | null;
}
