import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class MoveProductBatchGroupDto {
  @Field(() => Int)
  id: number;

  // @ValidateIf((o: MoveProductBatchDto) => !o.parentId)
  // @IsNullable(
  //   {},
  //   { message: 'productId is required if parentId is not provided' },
  // )
  @Field(() => Int)
  statusId: number;

  @Field(() => Int, { nullable: true })
  order?: number | null;
}
