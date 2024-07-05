import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateStatusDto {
  @Field(() => String)
  title: string;
}
