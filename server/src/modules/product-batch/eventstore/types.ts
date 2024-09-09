import { type JSONEventType } from '@eventstore/db-client';
import { Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

import type { JSONCompatible } from '@/common/helpers/utils.js';
import type { CreateOperationDto } from '@/operation/dtos/create-operation.dto.js';
import type { CreateProductBatchDto } from '@/product-batch/dtos/create-product-batch.dto.js';
import type { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';
import type { MoveProductBatchItemsDto } from '@/product-batch/dtos/move-product-batch-items.dto.js';

export const productBatchStreamName = (productBatchId: number) =>
  `ProductBatch-${productBatchId.toString()}`;

export interface ProductBatchCreatedEventData {
  id: number;
  statusId: number | null;
  groupId: number | null;
  productId: number;
  count: number;
  costPricePerUnit: number;
  operationsPricePerUnit: number | null;
  operationsPrice: number | null;
}
export type ProductBatchCreatedEvent = JSONEventType<
  'ProductBatchCreated',
  JSONCompatible<ProductBatchCreatedEventData>
>;

export interface ProductBatchCreatedFromSourceEventData {
  id: number;
  statusId: number | null;
  groupId: number | null;
  productId: number;
  count: number;
  costPricePerUnit: number;
  operationsPricePerUnit: number | null;
  operationsPrice: number | null;
  sourceIds: number[];
}
export type ProductBatchCreatedFromSourceEvent = JSONEventType<
  'ProductBatchCreatedFromSource',
  JSONCompatible<ProductBatchCreatedFromSourceEventData>
>;

export interface MoveProductsToChildBatchEventData {
  id: number;
  count: number;
  destinationID: number;
}
export type MoveProductsToChildBatchEvent = JSONEventType<
  'MoveProductsToChildBatch',
  JSONCompatible<MoveProductsToChildBatchEventData>
>;

export interface ProductBatchCreatedByAssemblingEventData {
  id: number;
  statusId: number | null;
  groupId: number | null;
  productId: number;
  count: number;
  costPricePerUnit: number;
  operationsPricePerUnit: number | null;
  operationsPrice: number | null;
  sources: { id: number; count: number; qty: number }[];
}

export type ProductBatchCreatedByAssemblingEvent = JSONEventType<
  'ProductBatchCreatedByAssembling',
  JSONCompatible<ProductBatchCreatedByAssemblingEventData>
>;

export type DeleteProductBatchEvent = JSONEventType<
  'DeleteProductBatch',
  JSONCompatible<{ id: number }>
>;
export type MoveProductBatchEvent = JSONEventType<
  'MoveProductBatch',
  JSONCompatible<MoveProductBatchDto>
>;

export type MoveProductBatchItemsEvent = JSONEventType<
  'MoveProductBatchItems',
  JSONCompatible<MoveProductBatchItemsDto>
>;

export type OperationCreatedEvent = JSONEventType<
  'CreateOperation',
  JSONCompatible<CreateOperationDto>
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
