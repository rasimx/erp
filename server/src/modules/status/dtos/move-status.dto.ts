import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class MoveStatusDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  order: number;
}
