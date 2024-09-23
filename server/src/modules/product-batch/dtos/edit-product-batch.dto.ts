import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class EditProductBatchDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  count: number;

  @Field(() => String)
  reason: string;
}
