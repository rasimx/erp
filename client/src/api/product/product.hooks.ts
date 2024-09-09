import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

import {
  getProductFragment,
  PRODUCT_LIST_QUERY,
  PRODUCT_SET_LIST_QUERY,
} from './product.gql';

export const useProductList = (ids?: number[]) => {
  const { data, loading } = useQuery(PRODUCT_LIST_QUERY, {
    fetchPolicy: 'network-only',
    variables: { ids },
  });

  const items = useMemo(
    () => getProductFragment(data?.productList.items) ?? [],
    [data],
  );

  return {
    items,
  };
};

export const useProductSetList = () => {
  const { data, loading } = useQuery(PRODUCT_SET_LIST_QUERY, {
    fetchPolicy: 'network-only',
  });

  const items = useMemo(
    () => getProductFragment(data?.productSetList.items) ?? [],
    [data],
  );

  return {
    items,
  };
};
