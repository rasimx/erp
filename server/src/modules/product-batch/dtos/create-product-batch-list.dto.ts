import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class CreateProductBatchItemDto {
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
  operationsPricePerUnit: number;

  @IsNumber()
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  operationsPrice: number;

  @Field(() => Int, { nullable: true, defaultValue: null })
  currencyCostPricePerUnit: number | null;
}

@InputType()
export class CreateProductBatchListDto {
  @Field(() => Int, { nullable: true, defaultValue: null })
  statusId: number | null;

  @Field(() => Int, { nullable: true, defaultValue: null })
  groupId: number | null;

  @Field(() => Int, { nullable: true, defaultValue: null })
  exchangeRate: number | null;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  grouped: boolean;

  @Field(() => String, { nullable: true, defaultValue: null })
  groupName: string | null;

  @Field(() => [CreateProductBatchItemDto])
  items: CreateProductBatchItemDto[];
}
