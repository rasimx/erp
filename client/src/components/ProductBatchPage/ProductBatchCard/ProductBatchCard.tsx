import { useModal } from '@ebay/nice-modal-react';
import { faSquare, faSquareCheck } from '@fortawesome/free-regular-svg-icons';
import { faUpDownLeftRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'primereact/button';
import React, { useCallback, useMemo } from 'react';

import { ProductBatch } from '../../../api/product-batch/product-batch.gql';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { CardProps } from '../../KanbanBoard/types';
import { MoveBtn } from '../MoveBtn/MoveBtn';
import {
  selectIsSelectingMode,
  selectSelectedIds,
  toggleSelect,
} from '../product-batch-page.slice';
import ProductBatchInfo from '../ProductBatchDetail/ProductBatchDetail';
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
    <div className={classes.card}>
      <div className={classes.header}>
        <MoveBtn sortableData={sortableData} />

        <div className={classes.sku} onClick={showProductBatchInfoDrawer}>
          {card.product.sku}
        </div>
        <div style={{ padding: '0 10px', fontWeight: 600 }}>{card.count}</div>
      </div>
      <div className={classes.name} onClick={showProductBatchInfoDrawer}>
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
    </div>
  );
});
