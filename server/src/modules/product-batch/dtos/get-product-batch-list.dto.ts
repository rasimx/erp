import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class GetProductBatchListDto {
  @Field(() => [Int], { nullable: true, defaultValue: [] })
  productIds: number[];

  @Field(() => [Int], { nullable: true, defaultValue: [] })
  statusIds: number[];
}
