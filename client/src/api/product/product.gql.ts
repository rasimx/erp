import { graphql } from '@/gql-types';

export const PRODUCT_FRAGMENT = graphql(`
  fragment Product on ProductDto {
    id
    name
    sku
  }
`);

export const PRODUCT_LIST_QUERY = graphql(`
  query productList($ids: [Int!]) {
    productList(ids: $ids) {
      items {
        ...Product
      }
    }
  }
`);
