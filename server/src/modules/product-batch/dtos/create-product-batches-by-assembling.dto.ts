import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class AssemblingSourceDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  selectedCount: number;
}

@InputType()
export class CreateProductBatchesByAssemblingDto {
  @Field(() => Int, { nullable: true, defaultValue: null })
  statusId: number | null;

  @Field(() => Int, { nullable: true, defaultValue: null })
  groupId: number | null;

  @IsNumber()
  @Field(() => Int)
  productSetId: number;

  @IsNumber()
  @Field(() => Int)
  fullCount: number;

  @Field(() => [AssemblingSourceDto])
  sources: AssemblingSourceDto[];
}
