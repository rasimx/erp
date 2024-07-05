import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum StatusType {
  custom = 'custom',
  ozon = 'ozon',
  wb = 'wb',
}

registerEnumType(StatusType, {
  name: 'StatusType',
});

@ObjectType()
export class StatusDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  title: string;

  @Field(() => Int)
  order: number;

  @Field(() => StatusType)
  type: StatusType;
}
