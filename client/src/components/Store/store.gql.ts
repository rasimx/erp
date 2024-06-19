import { FragmentType, graphql } from '@/gql-types';

export const StoreItemFragment = graphql(`
  fragment StoreItem on StoreByProduct {
    salesCount
    inStoreCount
    productBatches {
      id
      name
      count
      pricePerUnit
      costPrice
      fullPrice
      date
    }
    product {
      id
      sku
      name
    }
  }
`);

export const STORE_STATE_QUERY = graphql(`
  query storeState($productId: Int, $storeInput: StoreInput) {
    storeState(productId: $productId, storeInput: $storeInput) {
      id
      items {
        ...StoreItem
      }
    }
  }
`);

export type StoreItemType = FragmentType<typeof StoreItemFragment>;
