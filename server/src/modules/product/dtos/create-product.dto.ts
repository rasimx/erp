import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateProductDto {
  @Field(() => String)
  sku: string;

  @Field(() => String)
  name: string;
}
