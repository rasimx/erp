import { useQuery } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';

import apolloClient from '../../apollo-client';
import {
  GetProductBatchListDto,
  MoveProductBatchDto,
  MoveProductBatchGroupDto,
} from '../../gql-types/graphql';
import {
  getProductBatchFragment,
  ProductBatch,
} from '../product-batch/product-batch.gql';
import { useProductBatchMutations } from '../product-batch/product-batch.hook';
import {
  getProductBatchGroupFragment,
  ProductBatchGroup,
} from '../product-batch-group/product-batch-group.gql';
import { useProductBatchGroupMutations } from '../product-batch-group/product-batch-group.hook';
import { KANBAN_CARDS_QUERY } from './kanban.gql';

export type KanbanCard = ProductBatch | ProductBatchGroup;

export const useKanban = (dto: GetProductBatchListDto) => {
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>([]);

  const { moveProductBatch: moveBatch } = useProductBatchMutations();
  const { moveProductBatchGroup: moveGroup } = useProductBatchGroupMutations();

  // const { data, loading, refetch } = useQuery(KANBAN_CARDS_QUERY, {
  //   variables: { dto },
  //   fetchPolicy: 'network-only',
  // });

  const refetch = useCallback(() => {
    apolloClient
      .query({
        query: KANBAN_CARDS_QUERY,
        variables: { dto },
        fetchPolicy: 'network-only',
      })
      .then(data => {
        const batchList =
          getProductBatchFragment(data?.data.productBatchList) || [];
        const groupList =
          getProductBatchGroupFragment(data?.data.productBatchGroupList) || [];

        setKanbanCards(
          [...batchList, ...groupList].toSorted((a, b) => a.order - b.order),
        );
      });
  }, [dto]);
  //
  useEffect(() => {
    refetch();
  }, [dto]);

  // useEffect(() => {
  //   apolloClient
  //     .query({
  //       query: KANBAN_CARDS_QUERY,
  //       variables: { dto },
  //       fetchPolicy: 'network-only',
  //     })
  //     .then(data => {
  //       const batchList =
  //         getProductBatchFragment(data?.data.productBatchList) || [];
  //       const groupList =
  //         getProductBatchGroupFragment(data?.data.productBatchGroupList) || [];
  //
  //       setKanbanCards(
  //         [...batchList, ...groupList].toSorted((a, b) => a.order - b.order),
  //       );
  //     });
  // }, []);

  // useEffect(() => {
  //   const batchList = getProductBatchFragment(data?.productBatchList) || [];
  //   const groupList =
  //     getProductBatchGroupFragment(data?.productBatchGroupList) || [];
  //
  //   setKanbanCards(
  //     [...batchList, ...groupList].toSorted((a, b) => a.order - b.order),
  //   );
  // }, [data]);

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

  return {
    kanbanCards,
    moveProductBatch,
    moveProductBatchGroup,
    refetch,
  };
};
