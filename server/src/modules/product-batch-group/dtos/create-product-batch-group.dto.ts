import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class CreateProductBatchGroupDto {
  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int)
  statusId: number;

  @IsNotEmpty({ message: 'name is required' })
  @Field(() => String)
  name: string;
}
