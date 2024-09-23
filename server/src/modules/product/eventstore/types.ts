import { type JSONEventType } from '@eventstore/db-client';

import type { JSONCompatible } from '@/common/helpers/utils.js';
import type { CreateProductDto } from '@/product/dtos/create-product.dto.js';

export const productStreamName = (productId: number) =>
  `Product-${productId.toString()}`;

export interface ProductCreatedEventData extends CreateProductDto {
  id: number;
  userId: number;
}
export type ProductCreatedEvent = JSONEventType<
  'ProductCreated',
  JSONCompatible<ProductCreatedEventData>
>;

export interface ProductDeletedEventData {
  id: number;
  userId: number;
}
export type ProductDeletedEvent = JSONEventType<
  'ProductDeleted',
  JSONCompatible<ProductDeletedEventData>
>;
