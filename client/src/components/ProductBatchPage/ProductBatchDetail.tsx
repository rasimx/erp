import { useQuery } from '@apollo/client';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { CardContent, IconButton, Menu, MenuItem } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useCallback, useMemo } from 'react';

import { useOperation } from '../../api/operation/operation.hooks';
import { useProductBatchMutations } from '../../api/product-batch/product-batch.hook';
import {
  getProductBatchDetailFragment,
  PRODUCT_BATCH_DETAIL_QUERY,
} from '../../api/product-batch/product-batch-detail.gql';
import { toRouble } from '../../utils';
import OperationForm from '../OperationForm/OperationForm';
import withDrawer from '../withDrawer';
import EventListItem from './EventListItem';

export interface Props {
  productBatchId: number;
}

export const ProductBatchDetail = React.memo<Props>(props => {
  const { productBatchId } = props;

  const { data, refetch } = useQuery(PRODUCT_BATCH_DETAIL_QUERY, {
    variables: { id: productBatchId },
    fetchPolicy: 'network-only',
  });

  const productBatch = useMemo(
    () => data && getProductBatchDetailFragment(data.productBatchDetail),
    [data],
  );

  const { deleteProductBatch } = useProductBatchMutations();
  const { createOperation } = useOperation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDelete = () => {
    deleteProductBatch(productBatchId).then(() => {
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
      productBatches: productBatch ? [productBatch] : [],
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
  }, [handleClose, productBatch]);

  const listItems = productBatch
    ? [
        // {
        //   label: 'order',
        //   value: card.order,
        // },
        // { label: 'ID', value: card.id },
        // { label: 'productID', value: card.product.id },
        { label: 'SKU', value: productBatch.product.sku },
        { label: 'количество, шт', value: productBatch.count },
        {
          label: 'цена закупки 1 шт, р.',
          value: toRouble(productBatch.costPricePerUnit),
        },
        {
          label: 'сопутствующие траты за 1шт, р.',
          value: toRouble(productBatch.operationsPricePerUnit),
        },
        {
          label: 'себестоимость за 1шт, р.',
          value: toRouble(
            productBatch.operationsPricePerUnit + productBatch.costPricePerUnit,
          ),
        },
        {
          label: 'себестоимость партии, р.',
          value: toRouble(
            (productBatch.operationsPricePerUnit +
              productBatch.costPricePerUnit) *
              productBatch.count,
          ),
        },
        // {
        //   label: 'продано',
        //   value: aa?.count ?? 0,
        // },
      ]
    : [];

  console.log(productBatch);

  return (
    productBatch && (
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
          <Box sx={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
            {productBatch.name}
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
        <br />
        <Box sx={{ fontSize: 12 }}>
          {productBatch.events.map((event, index) => (
            <EventListItem event={event} />
          ))}
        </Box>
      </Box>
    )
  );
});

export default NiceModal.create(withDrawer(ProductBatchDetail));
