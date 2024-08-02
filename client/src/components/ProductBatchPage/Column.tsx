import { useModal } from '@ebay/nice-modal-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import { IconButton, Menu, MenuItem, Paper, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import omit from 'lodash/omit';
import React, { useCallback } from 'react';

import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { useProductBatchMutations } from '../../api/product-batch/product-batch.hook';
import { ProductBatchGroup } from '../../api/product-batch-group/product-batch-group.gql';
import { useProductBatchGroupMutations } from '../../api/product-batch-group/product-batch-group.hook';
import { StatusFragment } from '../../gql-types/graphql';
import CreateProductBatchForm from '../CreateProductBatch/ProductBatchForm';
import CreateProductBatchGroupForm from '../CreateProductBatchGroup/ProductBatchGroupForm';
import { ColumnProps } from '../KanbanBoard/types';
import { StoreStateProvider } from '../StoreState';

export interface Props
  extends ColumnProps<StatusFragment, ProductBatchGroup, ProductBatch> {
  refetch: () => void;
}

export const Column = React.memo<Props>(props => {
  const { createProductBatchGroup } = useProductBatchGroupMutations();
  const { createProductBatch } = useProductBatchMutations();
  const {
    column: status,
    refetch,
    sortableData,
    children,
    items,
    isActive,
  } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const createProductBatchGroupModal = useModal(CreateProductBatchGroupForm);
  const showCreateProductBatchGroupModal = useCallback(() => {
    createProductBatchGroupModal.show({
      groupStatus: status,
      onSubmit: async values => {
        createProductBatchGroup({
          name: values.name,
          statusId: values.statusId,
          existProductBatchIds: values.existProductBatches.map(
            ({ productBatch }) => productBatch.id,
          ),
          newProductBatches: values.newProductBatches.map(item => ({
            ...omit(item, 'product', 'statusId'),
            productId: item.product.id,
          })),
        })
          .then(result => {
            refetch();
          })
          .catch(err => {
            alert('ERROR');
          });
      },
    });
    handleClose();
  }, [status]);
  const createProductBatchModal = useModal(CreateProductBatchForm);
  const showCreateProductBatchModal = useCallback(() => {
    createProductBatchModal.show({
      initialValues: {},
      onSubmit: async values => {
        createProductBatch({
          ...omit(values, ['product']),
          productId: values.product.id,
          statusId: status.id,
          groupId: null,
        })
          .then(result => {
            refetch();
          })
          .catch(err => {
            alert('ERROR');
          });
      },
    });
    handleClose();
  }, [status]);

  return (
    <StoreStateProvider status={status} items={items} skip={isActive}>
      <Box
        component={Paper}
        elevation={3}
        variant="elevation"
        sx={{
          width: 300,
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            background: '#FAFAFA',
            // p: 1,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <IconButton
                ref={sortableData?.setActivatorNodeRef}
                {...sortableData?.listeners}
                sx={{
                  cursor: 'grab',
                }}
              >
                <OpenWithIcon />
              </IconButton>
              <Typography
                id="modal-modal-title"
                variant="h6"
                fontSize={14}
                component="h2"
                sx={{ flexGrow: 1 }}
              >
                {status.title}
              </Typography>
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
                <MenuItem onClick={showCreateProductBatchGroupModal}>
                  Добавить группу
                </MenuItem>
                <MenuItem onClick={showCreateProductBatchModal}>
                  Добавить партию
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>
        {children}
      </Box>
    </StoreStateProvider>
  );
});

export default Column;
