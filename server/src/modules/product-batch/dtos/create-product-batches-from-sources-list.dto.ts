import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateProductBatchesFromSourcesItemDto {
  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  count: number;

  @Field(() => [Int])
  sourceIds: number[];
}

@InputType()
export class CreateProductBatchesFromSourcesListDto {
  @Field(() => Int)
  statusId: number;

  @Field(() => Int, { nullable: true, defaultValue: null })
  groupId: number | null;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  grouped: boolean;

  @Field(() => String, { nullable: true, defaultValue: null })
  groupName: string | null;

  @Field(() => [CreateProductBatchesFromSourcesItemDto])
  items: CreateProductBatchesFromSourcesItemDto[];
}
