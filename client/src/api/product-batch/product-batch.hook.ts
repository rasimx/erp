import { useMutation, useQuery } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';

import { getFragmentData } from '@/gql-types';
import {
  MoveProductBatchDto,
  ProductBatchFragment,
  UpdateProductBatchInput,
} from '@/gql-types/graphql';

import {
  MOVE_PRODUCT_BATCH_MUTATION,
  PRODUCT_BATCH_FRAGMENT,
  PRODUCT_BATCH_LIST_QUERY,
} from './productBatch.gql';

export const useProductBatch = (productId: number) => {
  const [productBatchList, setProductBatchList] = useState<
    ProductBatchFragment[]
  >([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const orderFunc = (a: ProductBatchFragment, b: ProductBatchFragment) =>
    a.order - b.order;

  const { data: productBatchListData, loading } = useQuery(
    PRODUCT_BATCH_LIST_QUERY,
    { variables: { productId } },
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

  const [updateProductBatch] = useMutation(MOVE_PRODUCT_BATCH_MUTATION);

  const { enqueueSnackbar } = useSnackbar();

  const moveProductBatch = useCallback(
    (dto: MoveProductBatchDto) => {
      setLoadingId(dto.id);
      updateProductBatch({ variables: { dto } })
        .then(res => {
          // setProductBatchList(
          //   (
          //     getFragmentData(
          //       PRODUCT_BATCH_FRAGMENT,
          //       res.data?.moveProductBatchProductBatch,
          //     ) || []
          //   ).toSorted(orderFunc),
          // );
        })
        .catch(err => {
          // todo: обработать ошику
          enqueueSnackbar(err.message, {
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
    loading,
  };
};
