import { useQuery } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';

import { getFragmentData } from '../../gql-types';
import {
  GetProductBatchListDto,
  MoveProductBatchDto,
  MoveProductBatchGroupDto,
  ProductBatchFragment,
  ProductBatchGroupFragment,
} from '../../gql-types/graphql';
import { PRODUCT_BATCH_FRAGMENT } from '../product-batch/product-batch.gql';
import { useProductBatchMutations } from '../product-batch/product-batch.hook';
import { PRODUCT_BATCH_GROUP_FRAGMENT } from '../product-batch-group/product-batch-group.gql';
import { useProductBatchGroupMutations } from '../product-batch-group/product-batch-group.hook';
import { KANBAN_CARDS_QUERY } from './kanban.gql';

export type KanbanCard = ProductBatchFragment | ProductBatchGroupFragment;

export const useKanban = (dto: GetProductBatchListDto) => {
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>([]);

  const { moveProductBatch: moveBatch } = useProductBatchMutations();
  const { moveProductBatchGroup: moveGroup } = useProductBatchGroupMutations();

  const { data, loading, refetch } = useQuery(KANBAN_CARDS_QUERY, {
    variables: { dto },
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
      moveBatch(dto).then(res => {
        refetch();
      });
    },
    [kanbanCards],
  );

  const moveProductBatchGroup = useCallback(
    (dto: MoveProductBatchGroupDto) => {
      moveGroup(dto).then(res => {
        refetch();
      });
    },
    [kanbanCards],
  );

  return { kanbanCards, moveProductBatch, moveProductBatchGroup, refetch };
};
