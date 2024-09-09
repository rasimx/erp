import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class SourceProductBatchDto {
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

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int)
  fullCount: number;

  @IsNumber()
  @Field(() => Int)
  productId: number;

  @Field(() => [SourceProductBatchDto])
  sources: SourceProductBatchDto[];
}
