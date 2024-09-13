import { useModal } from '@ebay/nice-modal-react';
import { faSquare, faSquareCheck } from '@fortawesome/free-regular-svg-icons';
import { faUpDownLeftRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Card } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';

import { ProductBatch } from '../../../api/product-batch/product-batch.gql';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { CardProps } from '../../KanbanBoard/types';
import {
  selectIsSelectingMode,
  selectSelectedIds,
  toggleSelect,
} from '../product-batch-page.slice';
import ProductBatchInfo from '../ProductBatchDetail';
import classes from './ProductBatchCard.module.scss';

export interface Props extends CardProps<ProductBatch> {
  refetch: () => void;
  loading?: boolean;
}

export const ProductBatchCard = React.memo<Props>(props => {
  const dispatch = useAppDispatch();
  const isSelecting = useAppSelector(selectIsSelectingMode);
  const selectedIds = useAppSelector(selectSelectedIds);

  const { card, loading, refetch, sortableData } = props;

  const productBatchInfoDrawer = useModal(ProductBatchInfo);
  const showProductBatchInfoDrawer = useCallback(() => {
    productBatchInfoDrawer.show({
      productBatchId: card.id,
    });
  }, [productBatchInfoDrawer, card]);

  const isSelected = useMemo(
    () => selectedIds.includes(card.id),
    [card, selectedIds],
  );

  const selectHandle = useCallback(() => dispatch(toggleSelect(card.id)), []);

  return (
    <Card
      className={classes.card}
      shadow="sm"
      padding="sx"
      radius="sm"
      withBorder
    >
      <Card.Section className={classes.inner}>
        <ActionIcon
          variant="light"
          ref={sortableData?.setActivatorNodeRef}
          {...sortableData?.listeners}
        >
          <FontAwesomeIcon icon={faUpDownLeftRight} />
        </ActionIcon>
        <div className={classes.sku} onClick={showProductBatchInfoDrawer}>
          {card.product.sku}
        </div>
        <div style={{ padding: '0 10px', fontWeight: 600 }}>{card.count}</div>
      </Card.Section>
      <div
        style={{ padding: '10px', cursor: 'pointer', position: 'relative' }}
        onClick={showProductBatchInfoDrawer}
      >
        {card.product.name}
      </div>
      {isSelecting && (
        <div className={classes.selectingMode} onClick={selectHandle}>
          {isSelected ? (
            <FontAwesomeIcon icon={faSquareCheck} />
          ) : (
            <FontAwesomeIcon icon={faSquare} />
          )}
        </div>
      )}
    </Card>
  );
});
