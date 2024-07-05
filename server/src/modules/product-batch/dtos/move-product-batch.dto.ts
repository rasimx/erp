import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class MoveProductBatchDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { nullable: true })
  statusId: number | null;

  @Field(() => Int, { nullable: true })
  groupId: number | null;

  @Field(() => Int, { nullable: true })
  order?: number | null;
}
