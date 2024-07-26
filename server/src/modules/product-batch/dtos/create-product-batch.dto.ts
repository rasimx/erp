import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class CreateProductBatchDto {
  @Field(() => Int, { nullable: true, defaultValue: null })
  statusId: number;

  @Field(() => Int, { nullable: true, defaultValue: null })
  groupId: number;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int)
  count: number;

  @IsOptional()
  @IsNumber()
  @Field(() => Int, { nullable: true })
  parentId?: number | null;

  @IsNumber()
  @Field(() => Int)
  productId: number;

  @IsNotEmpty()
  @Field(() => String)
  date: string;

  @IsNotEmpty()
  @Field(() => String)
  name: string;

  @IsNumber()
  @Field(() => Int)
  costPricePerUnit: number;

  @IsNotEmpty()
  @Field(() => String)
  color: string;
}
