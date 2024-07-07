import { useMutation, useQuery } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';

import { getFragmentData } from '@/gql-types';
import {
  MoveProductBatchGroupDto,
  ProductBatchGroupFragment,
} from '@/gql-types/graphql';

import {
  MOVE_PRODUCT_BATCH_GROUP_MUTATION,
  PRODUCT_BATCH_GROUP_FRAGMENT,
  PRODUCT_BATCH_GROUP_LIST_QUERY,
} from './product-batch-group.gql';

export const useProductBatchGroup = (productId: number) => {
  const [productBatchGroupList, setProductBatchGroupList] = useState<
    ProductBatchGroupFragment[]
  >([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const orderFunc = (
    a: ProductBatchGroupFragment,
    b: ProductBatchGroupFragment,
  ) => a.order - b.order;

  const { data: productBatchGroupListData, loading } = useQuery(
    PRODUCT_BATCH_GROUP_LIST_QUERY,
    { variables: { productId } },
  );
  useEffect(() => {
    setProductBatchGroupList(
      (
        getFragmentData(
          PRODUCT_BATCH_GROUP_FRAGMENT,
          productBatchGroupListData?.productBatchGroupList,
        ) || []
      ).toSorted(orderFunc),
    );
  }, [productBatchGroupListData]);

  const [move] = useMutation(MOVE_PRODUCT_BATCH_GROUP_MUTATION);

  const { enqueueSnackbar } = useSnackbar();

  const moveProductBatchGroup = useCallback(
    (dto: MoveProductBatchGroupDto) => {
      setLoadingId(dto.id);
      move({ variables: { dto } })
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
          setProductBatchGroupList([...productBatchGroupList]);
        })
        .finally(() => {
          setLoadingId(null);
        });
    },
    [productBatchGroupList],
  );

  return {
    productBatchGroupList,
    moveProductBatchGroup,
    loadingId,
    loading,
  };
};
