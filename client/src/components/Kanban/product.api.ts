import { gql } from '@apollo/client';

import apolloClient from '../../apollo-client';
import { type Product, type Query } from '../../gql-types/graphql';

export const PRODUCT_LIST_QUERY = gql`
  query productList {
    productList {
      items {
        id
        name
      }
    }
  }
`;
export const fetchProductList = async (): Promise<Product[]> => {
  const response = await apolloClient.query<Pick<Query, 'productList'>>({
    query: PRODUCT_LIST_QUERY,
    fetchPolicy: 'network-only',
  });
  return response.data?.productList.items ?? [];
};
