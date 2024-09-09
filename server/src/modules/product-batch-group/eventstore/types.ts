import { type JSONEventType } from '@eventstore/db-client';

import type { JSONCompatible } from '@/common/helpers/utils.js';
import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';
import type { MoveProductBatchGroupDto } from '@/product-batch-group/dtos/move-product-batch-group.dto.js';

export const productBatchGroupStreamName = (productBatchGroupId: number) =>
  `ProductBatch-${productBatchGroupId.toString()}`;

export interface ProductBatchGroupCreatedEventData
  extends CreateProductBatchGroupDto {
  id: number;
}

export type ProductBatchGroupCreatedEvent = JSONEventType<
  'ProductBatchGroupCreated',
  JSONCompatible<ProductBatchGroupCreatedEventData>
>;
export type ProductBatchGroupDeletedEvent = JSONEventType<
  'ProductBatchGroupDeleted',
  JSONCompatible<{ id: number }>
>;
export type ProductBatchGroupMovedEvent = JSONEventType<
  'ProductBatchGroupMoved',
  JSONCompatible<MoveProductBatchGroupDto>
>;
