import { useQuery } from '@apollo/client';
import ClearIcon from '@mui/icons-material/Clear';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Modal,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React, {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getFragmentData, graphql } from '@/gql-types';

import { useKanban } from '../../api/kanban/kanban.hook';
import { PRODUCT_BATCH_FRAGMENT } from '../../api/product-batch/product-batch.gql';
import { ProductBatchFragment } from '../../gql-types/graphql';
import kanbanBoard from '../KanbanBoard/KanbanBoard';

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
  onChange: (data: ProductBatchFragment | undefined) => void;
  valueId?: number | null;
  productId: number;
}

const SelectProductBatch: FC<Props> = ({ onChange, productId, valueId }) => {
  const [selected, setSelected] = useState<ProductBatchFragment | undefined>();

  const { kanbanCards } = useKanban(productId);

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
    if (valueId && kanbanCards.length) {
      kanbanCards.forEach(item => {
        if (item.__typename == 'ProductBatchGroupDto') {
          item.productBatchList.forEach(child => {
            const data = getFragmentData(PRODUCT_BATCH_FRAGMENT, child);
            if (data.id == valueId) {
              setSelected(data);
              return;
            }
          });
        } else if (item.__typename == 'ProductBatchDto') {
          if (item.id == valueId) {
            setSelected(item);
            return;
          }
        }
      });
    }
  }, [valueId, kanbanCards]);

  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpenModal(false);
  }, []);

  useEffect(() => {
    if (selected) {
      onChange(selected);
    }
  }, [selected]);

  const choice = useCallback(
    (id: ProductBatchFragment) => () => {
      setSelected(id);
      setIsOpenModal(false);
      onChange(id);
    },
    [onChange],
  );
  const clear = useCallback(() => {
    setSelected(undefined);
    onChange(undefined);
  }, [onChange]);

  return (
    <>
      <ButtonGroup
        variant="contained"
        aria-label="Button group with a nested menu"
      >
        <Button
          onClick={() => {
            setIsOpenModal(true);
          }}
        >
          {selected?.id ?? `Выбрать партию`}
        </Button>
        {selected && (
          <Button size="small" onClick={clear}>
            <ClearIcon />
          </Button>
        )}
      </ButtonGroup>

      <Modal
        open={isOpenModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
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
                                      onClick={choice(itemData)}
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
                              onClick={choice(item as ProductBatchFragment)}
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
      </Modal>
    </>
  );
};

export default SelectProductBatch;
