import { FC, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useStatusList } from '@/api/status/status.hooks';
import KanbanBoard from '@/components/KanbanBoard/KanbanBoard';
import { MoveOptions } from '@/components/KanbanBoard/types';

import { useKanban } from '../../api/kanban/kanban.hook';
import { PRODUCT_BATCH_FRAGMENT } from '../../api/product-batch/product-batch.gql';
import { getFragmentData } from '../../gql-types';
import {
  ProductBatchFragment,
  ProductBatchGroupFragment,
  StatusDto,
  StatusType,
} from '../../gql-types/graphql';
import Column from './Column';
import Group from './Group';
import { ProductBatchCard } from './ProductBatchCard';

export const ProductBatchPage: FC = () => {
  const { productId } = useParams();
  const {
    statusList,
    moveStatus,
    loadingId: statusInLoadingId,
    loading: statusListLoading,
  } = useStatusList();

  const { kanbanCards, moveProductBatch, moveProductBatchGroup, refetch } =
    useKanban({ productIds: productId ? [Number(productId)] : [] });

  const cards = useMemo(() => [...kanbanCards], [kanbanCards]);

  const isCardInNotCustomColumn = useCallback(
    (item?: ProductBatchFragment) => {
      const customStatusIds = statusList
        .filter(({ type }) => type != StatusType.custom)
        .map(({ id }) => id);
      return item && customStatusIds.includes(item?.statusId!);
    },
    [statusList],
  );
  const isNotCustomColumn = useCallback(
    (column?: StatusDto) => column?.type != StatusType.custom,
    [],
  );

  const isForbiddenMove = useCallback(
    ({
      active,
      over,
    }: MoveOptions<
      StatusDto,
      ProductBatchGroupFragment,
      ProductBatchFragment
    >) => {
      // debugger;
      return false;
      // if (
      //   (overColumn && isNotCustomColumn(overColumn)) ||
      //   (overCard && isCardInNotCustomColumn(overCard)) ||
      //   (activeCard && isCardInNotCustomColumn(activeCard))
      // ) {
      //   return (
      //     activeCard &&
      //     ![overCard?.statusId, overColumn?.id].includes(activeCard.statusId)
      //   );
      // }
    },
    [statusList, cards],
  );

  const modifiers = useCallback(
    ({}: MoveOptions<
      StatusDto,
      ProductBatchGroupFragment,
      ProductBatchFragment
    >) => {
      return [];
      // if (activeCard && isCardInNotCustomColumn(activeCard))
      //   return [restrictToFirstScrollableAncestor];
    },
    [statusList],
  );

  return (
    <div>
      <KanbanBoard
        columnItems={statusList}
        renderColumn={props => <Column {...props} refetch={refetch} />}
        moveColumn={moveStatus}
        setColumnId={(item, newColumnId) => (item.statusId = newColumnId)}
        setGroupId={(item, newGroupId) => (item.groupId = newGroupId)}
        getColumnId={item => item.statusId ?? null}
        getGroupId={item => item.groupId ?? null}
        cardItems={cards}
        moveCard={data => {
          moveProductBatch({
            id: data.id,
            statusId: data.columnId,
            groupId: data.groupId,
            order: data.order,
          });
        }}
        isGroup={item => item.__typename == 'ProductBatchGroupDto'}
        renderGroup={props => <Group {...props} refetch={refetch} />}
        getGroupItems={item =>
          getFragmentData(PRODUCT_BATCH_FRAGMENT, item.productBatchList)
        }
        setGroupItems={(group, items) => (group.productBatchList = items)}
        moveGroup={data => {
          moveProductBatchGroup({
            id: data.id,
            statusId: data.columnId,
            order: data.order,
          });
        }}
        isForbiddenMove={isForbiddenMove}
        renderCard={props => <ProductBatchCard {...props} refetch={refetch} />}
      />
    </div>
  );
};
