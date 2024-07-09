import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

@InputType()
export class CreateProductBatchDto {
  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int)
  count: number;

  @IsNumber()
  @Field(() => Int, { nullable: true })
  statusId: number | null;

  @IsOptional()
  @IsNumber()
  @Field(() => Int, { nullable: true })
  parentId?: number | null;

  @ValidateIf((o: CreateProductBatchDto) => !o.parentId)
  @IsNumber(
    {},
    { message: 'productId is required if parentId is not provided' },
  )
  @Field(() => Int, { nullable: true })
  productId?: number | null;

  @ValidateIf((o: CreateProductBatchDto) => !o.parentId)
  @IsNotEmpty({ message: 'date is required if parentId is not provided' })
  @Field(() => String, { nullable: true })
  date?: string | null;

  @ValidateIf((o: CreateProductBatchDto) => !o.parentId)
  @IsNotEmpty({ message: 'name is required if parentId is not provided' })
  @Field(() => String, { nullable: true })
  name?: string | null;

  @ValidateIf((o: CreateProductBatchDto) => !o.parentId)
  @IsNumber(
    {},
    { message: 'costPricePerUnit is required if parentId is not provided' },
  )
  @Field(() => Int, { nullable: true })
  costPricePerUnit?: number | null;
}
