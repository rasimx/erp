import apolloClient from '@/apollo-client';
import { graphql } from '@/gql-types';
import { type Product } from '@/gql-types/graphql';

export const PRODUCT_LIST_QUERY = graphql(`
  query productList {
    productList {
      items {
        sku
        id
        name
      }
    }
  }
`);
export const fetchProductList = async (): Promise<Product[]> => {
  const response = await apolloClient.query({
    query: PRODUCT_LIST_QUERY,
    fetchPolicy: 'network-only',
  });
  return response.data?.productList.items ?? [];
};
