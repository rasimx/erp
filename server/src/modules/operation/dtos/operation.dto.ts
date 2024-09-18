import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ProportionType {
  equal = 'equal',
  manual = 'manual',
  weight = 'weight',
  volume = 'volume',
  costPricePerUnit = 'costPricePerUnit',
  costPrice = 'costPrice',
}

registerEnumType(ProportionType, {
  name: 'ProportionType',
});

@ObjectType()
export class OperationDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  cost: number;

  @Field(() => String)
  date: string;

  @Field(() => ProportionType)
  proportionType: ProportionType;

  // @OneToMany(() => ProductBatchOperationEntity, entity => entity.operation)
  // productBatchOperations: ProductBatchOperationEntity[];

  @Field(() => String)
  createdAt: Date;
}
