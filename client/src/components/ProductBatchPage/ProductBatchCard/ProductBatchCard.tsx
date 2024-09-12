import { useModal } from '@ebay/nice-modal-react';
import { faUpDownLeftRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Card } from '@mantine/core';
import React, { useCallback } from 'react';

import { ProductBatch } from '../../../api/product-batch/product-batch.gql';
import { CardProps } from '../../KanbanBoard/types';
import ProductBatchInfo from '../ProductBatchDetail';
import classes from './ProductBatchCard.module.scss';

export interface Props extends CardProps<ProductBatch> {
  refetch: () => void;
  loading?: boolean;
}

export const ProductBatchCard = React.memo<Props>(props => {
  const { card, loading, refetch, sortableData } = props;

  const productBatchInfoDrawer = useModal(ProductBatchInfo);
  const showProductBatchInfoDrawer = useCallback(() => {
    productBatchInfoDrawer.show({
      productBatchId: card.id,
    });
  }, [productBatchInfoDrawer, card]);

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
    </Card>
  );
});
