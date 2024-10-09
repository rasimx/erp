import type { ProductProps } from '@/product/domain/product.interfaces.js';
import type { ProductBatchEventEntity } from '@/product-batch/domain/product-batch-event.entity.js';

export interface CreateProductBatchProps {
  id: number;
  count: number;
  productProps: ProductProps;
  productId: number;
  statusId: number | null;
  groupId: number | null;
  costPricePerUnit: number;
  operationsPricePerUnit: number;
  operationsPrice: number;
  order: number;

  currencyCostPricePerUnit: number | null;
  exchangeRate: number | null;

  sourceIds?: number[] | null;
}

export interface ProductBatchProps {
  id: number;
  count: number;
  initialCount: number;
  productProps: ProductProps;
  productId: number;
  statusId: number | null;
  groupId: number | null;
  costPricePerUnit: number;
  operationsPricePerUnit: number;
  operationsPrice: number;
  order: number;

  currencyCostPricePerUnit: number | null;
  exchangeRate: number | null;

  sourceIds?: number[] | null;

  revision?: number;
}

export interface EventRepository {
  getAllEvents(aggregateId: number): Promise<ProductBatchEventEntity[]>;
  save(
    events: ProductBatchEventEntity | ProductBatchEventEntity[],
  ): Promise<void>;
}
