import { useModal } from '@ebay/nice-modal-react';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import { Card, CardContent, CircularProgress, IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useCallback } from 'react';

import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { CardProps } from '../KanbanBoard/types';
import ProductBatchInfo from './ProductBatchDetail';

const Preloader = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,.5)',
      }}
    >
      <CircularProgress />
    </Box>
  );
};

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
    <>
      <Card
        elevation={3}
        sx={{
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            backgroundColor: card.color,
            opacity: 0.2,
          }}
        ></Box>
        {loading && <Preloader />}
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              backgroundColor: 'rgba(0,0,0,.1)',
            }}
          >
            <IconButton
              size="small"
              ref={sortableData?.setActivatorNodeRef}
              {...sortableData?.listeners}
              sx={{
                cursor: 'grab',
              }}
            >
              <OpenWithIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Box
              onClick={showProductBatchInfoDrawer}
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
                flexGrow: 1,
                ml: 1,
              }}
            >
              {card.product.sku}
            </Box>
            <Box sx={{ p: '0 10px', fontWeight: 600 }}>{card.count}</Box>
          </Box>
          <CardContent
            sx={{ p: 1, cursor: 'pointer', position: 'relative' }}
            onClick={showProductBatchInfoDrawer}
          >
            {card.product.name}
          </CardContent>
        </Box>
      </Card>
    </>
  );
});
