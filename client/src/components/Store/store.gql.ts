import { graphql } from '../../gql-types';

export const STORE_STATE_QUERY = graphql(`
  query storeState($productId: Int, $storeInput: StoreInput) {
    storeState(productId: $productId, storeInput: $storeInput) {
      id
      items {
        salesCount
        inStoreCount
        productBatches {
          id
          name
          parentId
          statusId
          count
          pricePerUnit
          costPrice
          fullPrice
          date
          weight
          volume
          productId
          product {
            id
          }
        }
        product {
          id
          sku
          name
        }
      }
    }
  }
`);
