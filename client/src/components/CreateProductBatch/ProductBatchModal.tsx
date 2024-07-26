import NiceModal from '@ebay/nice-modal-react';
import { Box, Card, Paper, Stack, Typography } from '@mui/material';
import React, { type FC, useCallback, useEffect, useMemo } from 'react';

import { getFragmentData } from '@/gql-types';

import { useKanban } from '../../api/kanban/kanban.hook';
import { PRODUCT_BATCH_FRAGMENT } from '../../api/product-batch/product-batch.gql';
import { ProductBatchFragment } from '../../gql-types/graphql';
import withModal from '../withModal';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};

export interface Props {
  onSelect: (data: ProductBatchFragment) => void;
  productId: number;
  initialId?: number | null;
  closeModal: () => void;
}

const ProductBatchModal: FC<Props> = ({
  onSelect,
  productId,
  initialId,
  closeModal,
}) => {
  const { kanbanCards } = useKanban({ productIds: [productId] });

  const columns = useMemo(() => {
    const map = new Map<number, { id: number; title: string; order: number }>();
    kanbanCards.forEach(item => {
      if (item.status) {
        map.set(item.status.id, item.status);
      }
    });
    return [...map.values()].toSorted((a, b) => a.order - b.order);
  }, [kanbanCards]);

  useEffect(() => {
    if (initialId && kanbanCards.length) {
      kanbanCards.forEach(item => {
        if (item.__typename == 'ProductBatchGroupDto') {
          item.productBatchList.forEach(child => {
            const data = getFragmentData(PRODUCT_BATCH_FRAGMENT, child);
            if (data.id == initialId) {
              onSelect(data);
              return;
            }
          });
        } else if (item.__typename == 'ProductBatchDto') {
          if (item.id == initialId) {
            onSelect(item);
            return;
          }
        }
      });
    }
  }, [initialId, kanbanCards]);

  const onSelectHandle = useCallback(
    (value: ProductBatchFragment) => {
      onSelect(value);
      closeModal();
    },
    [onSelect, closeModal],
  );

  return (
    <Box sx={style}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Выбрать исходную партию
      </Typography>
      <Box>
        <Stack
          direction="row"
          spacing={2}
          alignContent="stretch"
          sx={{ flexGrow: 1, maxHeight: '100%' }}
        >
          {columns.map((column, index) => (
            <Paper elevation={3} variant="elevation" key={column.id}>
              <Box
                sx={{
                  background: '#FAFAFA',
                  p: 1,
                  textAlign: 'center',
                }}
              >
                {column.title}
              </Box>
              <Box sx={{ height: '100%', overflow: 'auto', flexGrow: 1 }}>
                <Stack spacing={2} sx={{ p: 1 }}>
                  {kanbanCards
                    .filter(item => item.statusId == column.id)
                    .map(item =>
                      item.__typename == 'ProductBatchGroupDto' ? (
                        <Card sx={{ cursor: 'pointer' }} key={item.id}>
                          <Stack spacing={2} sx={{ p: 1 }}>
                            {item.productBatchList.map(item => {
                              const itemData = getFragmentData(
                                PRODUCT_BATCH_FRAGMENT,
                                item,
                              );
                              return (
                                <Card
                                  sx={{ cursor: 'pointer' }}
                                  key={itemData.id}
                                  onClick={() => onSelectHandle(itemData)}
                                >
                                  {itemData.id}: {itemData.order}
                                </Card>
                              );
                            })}
                          </Stack>
                        </Card>
                      ) : (
                        <Card
                          sx={{ cursor: 'pointer' }}
                          key={item.id}
                          onClick={() =>
                            onSelectHandle(item as ProductBatchFragment)
                          }
                        >
                          {item.id}: {item.order}
                        </Card>
                      ),
                    )}
                </Stack>
              </Box>
            </Paper>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default NiceModal.create(withModal(ProductBatchModal));
