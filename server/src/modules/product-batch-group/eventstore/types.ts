import { type JSONEventType } from '@eventstore/db-client';

import type { JSONCompatible } from '@/common/helpers/utils.js';
import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';
import type { MoveProductBatchGroupDto } from '@/product-batch-group/dtos/move-product-batch-group.dto.js';

export const productBatchGroupStreamName = (productBatchGroupId: number) =>
  `ProductBatchGroup-${productBatchGroupId.toString()}`;

export interface ProductBatchGroupCreatedEventData
  extends CreateProductBatchGroupDto {
  id: number;
  userId: number;
}

export type ProductBatchGroupCreatedEvent = JSONEventType<
  'ProductBatchGroupCreated',
  JSONCompatible<ProductBatchGroupCreatedEventData>
>;

export interface ProductBatchGroupDeletedEventData {
  id: number;
  userId: number;
}
export type ProductBatchGroupDeletedEvent = JSONEventType<
  'ProductBatchGroupDeleted',
  JSONCompatible<ProductBatchGroupDeletedEventData>
>;

export interface ProductBatchGroupMovedEventData
  extends MoveProductBatchGroupDto {
  userId: number;
}
export type ProductBatchGroupMovedEvent = JSONEventType<
  'ProductBatchGroupMoved',
  JSONCompatible<ProductBatchGroupMovedEventData>
>;
