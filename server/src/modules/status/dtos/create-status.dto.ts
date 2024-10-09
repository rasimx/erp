import { Field, InputType, Int } from '@nestjs/graphql';

import { StatusType } from '@/status/dtos/status.dto.js';

@InputType()
export class CreateStatusDto {
  @Field(() => String)
  title: string;

  @Field(() => Number, { nullable: true, defaultValue: null })
  storeId: number | null;

  @Field(() => StatusType, { nullable: true, defaultValue: StatusType.custom })
  type: StatusType;
}
