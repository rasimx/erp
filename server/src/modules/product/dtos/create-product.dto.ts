import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateProductDto {
  @Field(() => String)
  sku: string;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  width: number; // в мм

  @Field(() => Int)
  height: number; // в мм

  @Field(() => Int)
  length: number; // в мм

  @Field(() => Int)
  weight: number; // в граммах
}
