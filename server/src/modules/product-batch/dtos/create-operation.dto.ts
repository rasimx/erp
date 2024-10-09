import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateOperationDto {
  @Field(() => String)
  name: string;

  @Field(() => Int)
  cost: number;

  @Field(() => Int, { nullable: true, defaultValue: null })
  currencyCost: number | null;

  @Field(() => Int, { nullable: true, defaultValue: null })
  exchangeRate: number | null;

  @Field(() => String)
  date: string;

  @Field(() => Int)
  productBatchId: number;
}
