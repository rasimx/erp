import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class SourceProductBatchDto {
  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  id: number;

  @Field(() => Int)
  selectedCount: number;
}

@InputType()
export class CreateProductBatchesFromSourcesDto {
  @Field(() => Int, { nullable: true, defaultValue: null })
  statusId: number | null;

  @Field(() => Int, { nullable: true, defaultValue: null })
  groupId: number | null;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  grouped: boolean;

  @Field(() => String, { nullable: true, defaultValue: null })
  groupName: string | null;

  @Field(() => [SourceProductBatchDto])
  sources: SourceProductBatchDto[];
}
