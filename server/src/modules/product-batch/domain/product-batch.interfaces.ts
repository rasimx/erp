export interface ProductBatchProps {
  id: number;
  count: number;
  initialCount: number;
  productId: number;
  statusId: number | null;
  groupId: number | null;
  costPricePerUnit: number;
  operationsPricePerUnit: number;
  operationsPrice: number;
  order: number;

  weight: number;
  volume: number;

  currencyCostPricePerUnit: number | null;
  exchangeRate: number | null;

  sourceIds?: number[] | null;
}
