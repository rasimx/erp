import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class MoveProductBatchDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  statusId: number;

  @Field(() => Int, { nullable: true })
  order?: number | null;
}
