import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateProductBatchGroupDto {
  @Field(() => Int)
  statusId: number;

  @Field(() => String)
  name: string;

  @Field(() => [Int])
  existProductBatchIds: number[];
}
