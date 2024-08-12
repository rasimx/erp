import type { JSONEventType, JSONType } from '@eventstore/db-client';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

import { OperationDto } from '@/operation/dtos/operation.dto.js';
import { ProductBatchDto } from '@/product-batch/dtos/product-batch.dto.js';

@ObjectType()
export class EventDto implements JSONEventType {
  @Field(() => String)
  type: string;

  @Field(() => GraphQLJSONObject)
  data: JSONType;
}

@ObjectType()
export class ProductBatchDetailDto extends ProductBatchDto {
  @Field(() => [EventDto])
  events: EventDto[];

  @Field(() => [OperationDto])
  operations: OperationDto[];
}
