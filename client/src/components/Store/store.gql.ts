import { FragmentType, graphql } from '@/gql-types';
//
// export const StoreItemFragment = graphql(`
//   fragment StoreItem on StoreByProduct {
//     salesCount
//     inStoreCount
//     productBatches {
//       id
//       name
//       count
//       pricePerUnit
//       costPrice
//       fullPrice
//       date
//     }
//     product {
//       id
//       sku
//       name
//     }
//   }
// `);
//
// export const STORE_STATE_QUERY = graphql(`
//   query storeState($productId: Int, $statusId: Int) {
//     storeState(productId: $productId, statusId: $statusId) {
//       id
//       items {
//         ...StoreItem
//       }
//     }
//   }
// `);
//
// export type StoreItemType = FragmentType<typeof StoreItemFragment>;
