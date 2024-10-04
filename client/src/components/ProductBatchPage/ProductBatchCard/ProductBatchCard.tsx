import { useModal } from '@ebay/nice-modal-react';
import { faSquare, faSquareCheck } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useMemo } from 'react';

import { ProductBatch } from '../../../api/product-batch/product-batch.gql';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { CardProps } from '../../KanbanBoard/types';
import { MoveBtn } from '../MoveBtn/MoveBtn';
import {
  selectIsSelectingMode,
  selectSelectedProductBatches,
  toggleSelect,
} from '../product-batch-page.slice';
import ProductBatchDetail from '../ProductBatchDetail/ProductBatchDetail';
import classes from './ProductBatchCard.module.scss';

export interface Props extends CardProps<ProductBatch> {
  refetch: () => void;
  loading?: boolean;
}

export const ProductBatchCard = React.memo<Props>(props => {
  const dispatch = useAppDispatch();
  const isSelecting = useAppSelector(selectIsSelectingMode);
  const selectedProductBatches = useAppSelector(selectSelectedProductBatches);

  const { card, loading, refetch, sortableData } = props;

  const productBatchDetailDrawer = useModal(ProductBatchDetail);
  const showProductBatchInfoDrawer = useCallback(() => {
    productBatchDetailDrawer.show({
      productBatchId: card.id,
      onClose: () => refetch(),
    });
  }, [productBatchDetailDrawer, card]);

  const isSelected = useMemo(
    () => selectedProductBatches.map(item => item.id).includes(card.id),
    [card, selectedProductBatches],
  );

  const selectHandle = useCallback(() => dispatch(toggleSelect(card)), []);

  return (
    <div className={classes.card}>
      <div className={classes.header}>
        <MoveBtn sortableData={sortableData} />

        <div className={classes.sku} onClick={showProductBatchInfoDrawer}>
          {card.product.sku} #{card.order}
        </div>
        <div style={{ padding: '0 10px', fontWeight: 600 }}>{card.count}</div>
      </div>
      <div className={classes.name} onClick={showProductBatchInfoDrawer}>
        {card.id}: {card.product.name}
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
