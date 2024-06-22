import { useMutation, useQuery } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';

import { getFragmentData } from '@/gql-types';
import {
  ProductBatchFragment,
  UpdateProductBatchInput,
} from '@/gql-types/graphql';

import {
  PRODUCT_BATCH_FRAGMENT,
  PRODUCT_BATCH_LIST_QUERY,
  UPDATE_PRODUCT_BATCH_MUTATION,
} from './productBatch.gql';

export const useProductBatch = () => {
  const [productBatchList, setProductBatchList] = useState<
    ProductBatchFragment[]
  >([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const orderFunc = (a: ProductBatchFragment, b: ProductBatchFragment) =>
    a.order - b.order;

  const { data: productBatchListData, loading } = useQuery(
    PRODUCT_BATCH_LIST_QUERY,
  );
  useEffect(() => {
    setProductBatchList(
      (
        getFragmentData(
          PRODUCT_BATCH_FRAGMENT,
          productBatchListData?.productBatchList,
        ) || []
      ).toSorted(orderFunc),
    );
  }, [productBatchListData]);

  const [updateProductBatch] = useMutation(UPDATE_PRODUCT_BATCH_MUTATION);

  const { enqueueSnackbar } = useSnackbar();

  const moveProductBatch = useCallback(
    (input: UpdateProductBatchInput) => {
      setLoadingId(input.id);
      updateProductBatch({ variables: { input } })
        .then(res => {
          setProductBatchList(
            (
              getFragmentData(
                PRODUCT_BATCH_FRAGMENT,
                res.data?.updateProductBatch,
              ) || []
            ).toSorted(orderFunc),
          );
        })
        .catch(err => {
          // todo: обработать ошику
          enqueueSnackbar('This is a error message!', {
            variant: 'error',
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          });
          setProductBatchList([...productBatchList]);
        })
        .finally(() => {
          setLoadingId(null);
        });
    },
    [productBatchList],
  );

  return {
    productBatchList,
    moveProductBatch,
    loadingId,
  };
};
