import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

import { CreateProductBatchDto } from '@/product-batch/dtos/create-product-batch.dto.js';

@InputType()
export class CreateProductBatchGroupDto {
  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int)
  statusId: number;

  @IsNotEmpty({ message: 'name is required' })
  @Field(() => String)
  name: string;

  @Field(() => [Int])
  existProductBatchIds: number[];

  // @Field(() => [CreateProductBatchDto])
  // newProductBatches: CreateProductBatchDto[];
}
