import { Field, ObjectType } from '@nestjs/graphql';

import { EventDto } from '@/product-batch/dtos/product-batch-detail.dto.js';
import { ProductBatchGroupDto } from '@/product-batch-group/dtos/product-batch-group.dto.js';

@ObjectType()
export class ProductBatchGroupDetailDto extends ProductBatchGroupDto {
  @Field(() => [EventDto])
  events: EventDto[];
}
