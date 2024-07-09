import { useMutation, useQuery } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getFragmentData } from '../../gql-types';
import {
  MoveProductBatchDto,
  MoveProductBatchGroupDto,
  ProductBatchFragment,
  ProductBatchGroupFragment,
} from '../../gql-types/graphql';
import {
  MOVE_PRODUCT_BATCH_MUTATION,
  PRODUCT_BATCH_FRAGMENT,
  PRODUCT_BATCH_LIST_QUERY,
} from '../product-batch/product-batch.gql';
import {
  MOVE_PRODUCT_BATCH_GROUP_MUTATION,
  PRODUCT_BATCH_GROUP_FRAGMENT,
} from '../product-batch-group/product-batch-group.gql';

export type KanbanCard = ProductBatchFragment | ProductBatchGroupFragment;

export const useKanban = (productId?: number) => {
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>([]);
  console.log(kanbanCards);

  const [moveBatch] = useMutation(MOVE_PRODUCT_BATCH_MUTATION);
  const [moveGroup] = useMutation(MOVE_PRODUCT_BATCH_GROUP_MUTATION);

  const { enqueueSnackbar } = useSnackbar();
  const skip = useMemo(() => kanbanCards.length > 0, [kanbanCards]);

  const { data, loading, refetch } = useQuery(PRODUCT_BATCH_LIST_QUERY, {
    variables: { productId },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const batchList =
      getFragmentData(PRODUCT_BATCH_FRAGMENT, data?.productBatchList) || [];
    const groupList =
      getFragmentData(
        PRODUCT_BATCH_GROUP_FRAGMENT,
        data?.productBatchGroupList,
      ) || [];

    setKanbanCards(
      [...batchList, ...groupList].toSorted((a, b) => a.order - b.order),
    );
  }, [data]);

  const moveProductBatch = useCallback(
    (dto: MoveProductBatchDto) => {
      moveBatch({ variables: { dto } })
        .then(res => {
          refetch();
        })
        .catch(err => {
          // todo: обработать ошику
          enqueueSnackbar(err.message, {
            variant: 'error',
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          });
          // setKanbanCards([...kanbanCards]);
        });
    },
    [kanbanCards],
  );

  const moveProductBatchGroup = useCallback(
    (dto: MoveProductBatchGroupDto) => {
      moveGroup({ variables: { dto } })
        .then(res => {
          refetch();
        })
        .catch(err => {
          // todo: обработать ошику
          enqueueSnackbar(err.message, {
            variant: 'error',
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          });
          // setKanbanCards([...kanbanCards]);
        });
      // .finally(() => {
      //   setLoadingId(null);
      // });
    },
    [kanbanCards],
  );

  return { kanbanCards, moveProductBatch, moveProductBatchGroup };
};
