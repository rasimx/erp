import { useQuery } from '@apollo/client';

import { type Query } from '@/gql-types/graphql';

import { PRODUCT_LIST_QUERY } from './product.api';

export const useProductList = () => {
  const { data, loading } = useQuery<Pick<Query, 'productList'>>(
    PRODUCT_LIST_QUERY,
    {
      fetchPolicy: 'network-only',
    },
  );

  return { items: data?.productList.items ?? [] };
};
