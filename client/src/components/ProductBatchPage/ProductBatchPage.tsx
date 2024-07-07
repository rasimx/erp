import { FC, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useProductBatch } from '@/api/product-batch/product-batch.hook';
import { useStatus } from '@/api/status/status.hooks';
import KanbanBoard from '@/components/KanbanBoard/KanbanBoard';
import {
  CardOptions,
  ColumnOptions,
  MoveOptions,
} from '@/components/KanbanBoard/types';

import { useProductBatchGroup } from '../../api/product-batch-group/product-batch-group.hook';
import {
  ProductBatchFragment,
  ProductBatchGroupFragment,
  // ProductBatchGroupFragment,
  StatusDto,
  StatusType,
} from '../../gql-types/graphql';
import { ProductBatchCard } from './ProductBatchCard';
// import ProductBatchGroupCard from './ProductBatchGroupCard';

export const ProductBatchPage: FC = () => {
  const { productId } = useParams();
  const {
    statusList,
    moveStatus,
    loadingId: statusInLoadingId,
    loading: statusListLoading,
  } = useStatus();

  const { productBatchList, moveProductBatch } = useProductBatch(
    Number(productId),
  );
  const { productBatchGroupList, moveProductBatchGroup } = useProductBatchGroup(
    Number(productId),
  );

  const orderFunc = (a: { order: number }, b: { order: number }) =>
    a.order - b.order;

  const cards = useMemo(() => {
    // const groupMap = new Map<number, ProductBatchGroupFragment>([
    //   ...productBatchList
    //     .filter(item => !!item.group)
    //     .map(
    //       item =>
    //         [item.group?.id, item.group] as [number, ProductBatchGroupFragment],
    //     ),
    // ]);

    return [...productBatchList, ...productBatchGroupList].toSorted(orderFunc);
  }, [productBatchList, productBatchGroupList]);

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
    [statusList, productBatchList],
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
    [statusList, productBatchList],
  );

  return (
    <KanbanBoard
      columnItems={statusList}
      getColumnTitle={status => status.title + ' #' + status.id}
      moveColumn={moveStatus}
      setColumnId={(item, newColumnId) => (item.statusId = newColumnId)}
      setGroupId={(item, newGroupId) => (item.groupId = newGroupId)}
      getColumnId={item => item.statusId}
      getGroupId={item => item.groupId}
      cardItems={cards}
      moveCard={data =>
        moveProductBatch({
          id: data.id,
          statusId: data.columnId,
          order: data.order,
        })
      }
      isGroup={item => (item as ProductBatchGroupFragment).productBatchList}
      getGroupTitle={group => group.name}
      getGroupItems={item => item.productBatchList}
      setGroupItems={(group, items) => (group.productBatchList = items)}
      moveGroup={data => {}}
      isForbiddenMove={isForbiddenMove}
      modifiers={modifiers}
      renderCard={card => (
        <ProductBatchCard card={card as ProductBatchFragment} />
      )}
    />
  );
};
