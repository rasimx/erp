import { type JSONEventType } from '@eventstore/db-client';
import type { UID } from '@type-ddd/core';
import { ID } from '@type-ddd/core';

import type { JSONCompatible } from '@/common/helpers/utils.js';
import type { CreateOperationDto } from '@/operation/dtos/create-operation.dto.js';
import type { CreateProductBatchItemDto } from '@/product-batch/dtos/create-product-batch-list.dto.js';
import type { EditProductBatchDto } from '@/product-batch/dtos/edit-product-batch.dto.js';
import type { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';

export const productBatchStreamName = (productBatchId: number) =>
  `ProductBatch-${productBatchId.toString()}`;

export interface ProductBatchCreatedEventData
  extends CreateProductBatchItemDto {
  statusId: number | null;
  groupId: number | null;
  exchangeRate: number | null;
  userId: number;
}
export type ProductBatchCreatedEvent = JSONEventType<
  'ProductBatchCreated',
  JSONCompatible<ProductBatchCreatedEventData>
>;

export interface ProductBatchEditedEventData extends EditProductBatchDto {
  userId: number;
}
export type ProductBatchEditedEvent = JSONEventType<
  'ProductBatchEdited',
  JSONCompatible<ProductBatchEditedEventData>
>;

export interface ProductBatchCreatedFromSourceEventData
  extends ProductBatchCreatedEventData {
  sourceId: number;
}
export type ProductBatchCreatedFromSourceEvent = JSONEventType<
  'ProductBatchCreatedFromSource',
  JSONCompatible<ProductBatchCreatedFromSourceEventData>
>;

export interface MoveProductsToChildBatchEventData {
  id: number;
  userId: number;
  count: number;
  destinationID: number;
}
export type MoveProductsToChildBatchEvent = JSONEventType<
  'MoveProductsToChildBatch',
  JSONCompatible<MoveProductsToChildBatchEventData>
>;

export interface ProductBatchCreatedByAssemblingEventData
  extends ProductBatchCreatedEventData {
  sources: { id: number; count: number; qty: number }[];
}
export type ProductBatchCreatedByAssemblingEvent = JSONEventType<
  'ProductBatchCreatedByAssembling',
  JSONCompatible<ProductBatchCreatedByAssemblingEventData>
>;

export interface ProductBatchDeletedEventData {
  id: number;
  count: number;
  userId: number;
}
export type ProductBatchDeletedEvent = JSONEventType<
  'ProductBatchDeleted',
  JSONCompatible<ProductBatchDeletedEventData>
>;

export interface ProductBatchMovedEventData extends MoveProductBatchDto {
  userId: number;
}
export type ProductBatchMovedEvent = JSONEventType<
  'ProductBatchMoved',
  JSONCompatible<ProductBatchMovedEventData>
>;

export interface OperationCreatedEventData extends CreateOperationDto {
  userId: number;
}
export type OperationCreatedEvent = JSONEventType<
  'OperationCreated',
  JSONCompatible<OperationCreatedEventData>
>;

export interface GroupOperationCreatedEventData extends CreateOperationDto {
  userId: number;
}
export type GroupOperationCreatedEvent = JSONEventType<
  'GroupOperationCreated',
  JSONCompatible<GroupOperationCreatedEventData>
>;

/*
 * события
 * - партия
 *  - добавление
 *  - перенос
 *  - редактирование
 *  - удаление
 *  - перенос части товаров в другую партию
 *  - добавление в группу
 *  - удаление из группы
 *  - добавление операции
 *  - удаление операции
 *  - редактирование операции
 * - группа
 *  - добавление группы
 *  - перенос
 *  - редактирование группы
 *  - удаление группы
 *  - добавление операции
 *  - удаление операции
 *  - редактирование операции
 * */
