import { useModal } from '@ebay/nice-modal-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import {
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import Box from '@mui/material/Box';
import React, { useCallback } from 'react';

import { useOperation } from '../../api/operation/operation.hooks';
import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { useProductBatchMutations } from '../../api/product-batch/product-batch.hook';
import { toRouble } from '../../utils';
import { CardProps } from '../KanbanBoard/types';
import OperationForm from '../OperationForm/OperationForm';
import { useStoreStateByProductBatch } from '../StoreState';
import ProductBatchInfo from './ProductBatchInfo';

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

  const { deleteProductBatch } = useProductBatchMutations();
  const { createOperation } = useOperation();
  const { aa } = useStoreStateByProductBatch(card);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDelete = () => {
    deleteProductBatch(card.id).then(() => {
      handleClose();
      refetch();
    });
  };
  const operationFormModal = useModal(OperationForm);
  const showOperationFormModal = useCallback(() => {
    operationFormModal.show({
      initialValues: {
        groupId: null,
      },
      productBatches: [card],
      onSubmit: async values => {
        createOperation(values)
          .then(result => {
            refetch();
          })
          .catch(err => {
            alert('ERROR');
          });
      },
    });
    handleClose();
  }, [handleClose, card]);

  const productBatchInfoDrawer = useModal(ProductBatchInfo);
  const showProductBatchInfoDrawer = useCallback(() => {
    console.log('aaa');
    productBatchInfoDrawer.show({
      productBatchId: card.id,
    });
  }, [productBatchInfoDrawer, card]);

  const listItems = [
    {
      label: 'order',
      value: card.order,
    },
    { label: 'ID', value: card.id },
    { label: 'productID', value: card.product.id },
    { label: 'SKU', value: card.product.sku },
    { label: 'количество, шт', value: card.count },
    { label: 'цена закупки 1 шт, р.', value: toRouble(card.costPricePerUnit) },
    {
      label: 'сопутствующие траты за 1шт, р.',
      value: toRouble(card.operationsPricePerUnit),
    },
    {
      label: 'себестоимость за 1шт, р.',
      value: toRouble(card.operationsPricePerUnit + card.costPricePerUnit),
    },
    {
      label: 'себестоимость партии, р.',
      value: toRouble(
        (card.operationsPricePerUnit + card.costPricePerUnit) * card.count,
      ),
    },
    {
      label: 'продано',
      value: aa?.count ?? 0,
    },
  ];

  return (
    <>
      <Card
        elevation={3}
        sx={{
          position: 'relative',
          // height: 380,
          // backgroundColor: card.color,
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
              sx={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }}
            >
              {card.name}
            </Box>

            <IconButton
              aria-label="more"
              id="long-button"
              aria-controls={open ? 'long-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="long-menu"
              MenuListProps={{
                'aria-labelledby': 'long-button',
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={showOperationFormModal}>
                Добавить операцию
              </MenuItem>
              <MenuItem onClick={handleDelete}>Удалить</MenuItem>
            </Menu>
          </Box>
          <CardContent>
            <Box sx={{ fontWeight: 600, pb: 2 }}>{card.product.name}</Box>
            <Box sx={{ fontSize: 12 }}>
              {listItems.map((item, index) => (
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between' }}
                  key={index}
                >
                  <Box>{item.label}</Box>
                  <Box>{item.value}</Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Box>
      </Card>
    </>
  );
});
