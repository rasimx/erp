import { useQuery } from '@apollo/client';

import { getFragmentData } from '../../gql-types';
import { PRODUCT_FRAGMENT, PRODUCT_LIST_QUERY } from './product.gql';

export const useProductList = (ids?: number[]) => {
  const { data, loading } = useQuery(PRODUCT_LIST_QUERY, {
    fetchPolicy: 'network-only',
    variables: { ids },
  });

  return {
    items: getFragmentData(PRODUCT_FRAGMENT, data?.productList.items) ?? [],
  };
};
