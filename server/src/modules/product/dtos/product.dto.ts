import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SetItemDto {
  @Field(() => Int)
  productId: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  sku: string;

  @Field(() => Int)
  qty: number;
}

@ObjectType()
export class ProductDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  sku: string;

  @Field(() => Int)
  width: number; // в мм

  @Field(() => Int)
  height: number; // в мм

  @Field(() => Int)
  length: number; // в мм

  @Field(() => Int)
  weight: number; // в граммах

  @Field(() => [SetItemDto], { defaultValue: [] })
  setItems: SetItemDto[];
}
