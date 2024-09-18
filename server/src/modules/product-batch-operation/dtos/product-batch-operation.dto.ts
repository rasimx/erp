import { Field, Float, InputType, Int } from '@nestjs/graphql';

@InputType()
export class ProductBatchOperationDto {
  @Field(() => Int)
  productBatchId: number;

  @Field(() => Float)
  proportion: number;

  @Field(() => Int)
  cost: number;
}
