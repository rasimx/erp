import { useModal } from '@ebay/nice-modal-react';
import { MoreVert, OpenWith } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Paper, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import omit from 'lodash/omit';
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { useProductBatchMutations } from '../../api/product-batch/product-batch.hook';
import { ProductBatchGroup } from '../../api/product-batch-group/product-batch-group.gql';
import { useProductBatchGroupMutations } from '../../api/product-batch-group/product-batch-group.hook';
import { StatusFragment } from '../../gql-types/graphql';
import { CreateProductBatchModal } from '../CreateProductBatch/CreateProductBatchForm';
import { CreateProductBatchesByAssemblingModal } from '../CreateProductBatchesByAssembling/modal';
import { CreateProductBatchesFromSourcesModal } from '../CreateProductBatchesFromSources/modal';
import { ProductBatchGroupModal } from '../CreateProductBatchGroup/ProductBatchGroupForm';
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

  const createProductBatchGroupModal = useModal(ProductBatchGroupModal);
  const showCreateProductBatchGroupModal = useCallback(() => {
    createProductBatchGroupModal.show({
      groupStatus: status,
      onSubmit: async values => {
        return createProductBatchGroup({
          name: values.name,
          statusId: values.statusId,
          existProductBatchIds: values.existProductBatches.map(
            ({ productBatch }) => productBatch.id,
          ),
          // @ts-ignore
          newProductBatches: values.newProductBatches.map(item => ({
            ...omit(item, 'product', 'statusId'),
            productId: item.product.id,
          })),
        })
          .then(result => {
            refetch();
            createProductBatchGroupModal.hide();
            return result;
          })
          .catch(err => {
            alert('ERROR');
            return err;
          });
      },
    });
    handleClose();
  }, [status]);

  const createProductBatchModal = useModal(CreateProductBatchModal);
  const showCreateProductBatchModal = useCallback(() => {
    createProductBatchModal.show({
      initialValues: {
        statusId: status.id,
      },
      onSubmit: async values => {
        // createProductBatch({
        //   ...omit(values, ['product']),
        //   productId: values.product.id,
        //   statusId: status.id,
        //   groupId: null,
        // })
        //   .then(result => {
        //     refetch();
        //   })
        //   .catch(err => {
        //     alert('ERROR');
        //   });
      },
    });
    handleClose();
  }, [status]);

  const createProductBatchesByAssemblingModal = useModal(
    CreateProductBatchesByAssemblingModal,
  );
  const showCreateProductBatchesByAssemblingModal = useCallback(() => {
    createProductBatchesByAssemblingModal.show({
      initialValues: {
        statusId: status.id,
      },
      onSubmit: async values => {
        // createProductBatch({
        //   ...omit(values, ['product']),
        //   productId: values.product.id,
        //   statusId: status.id,
        //   groupId: null,
        // })
        //   .then(result => {
        //     refetch();
        //   })
        //   .catch(err => {
        //     alert('ERROR');
        //   });
      },
    });
    handleClose();
  }, [status]);

  const createProductBatchesFromSourcesModal = useModal(
    CreateProductBatchesFromSourcesModal,
  );
  const showCreateProductBatchesFromSourcesModal = useCallback(() => {
    createProductBatchesFromSourcesModal.show({
      initialValues: {
        statusId: status.id,
      },
      onSubmit: async values => {
        // createProductBatch({
        //   ...omit(values, ['product']),
        //   productId: values.product.id,
        //   statusId: status.id,
        //   groupId: null,
        // })
        //   .then(result => {
        //     refetch();
        //   })
        //   .catch(err => {
        //     alert('ERROR');
        //   });
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
          width: '100%',
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
                <OpenWith />
              </IconButton>

              <Typography
                id="modal-modal-title"
                variant="h6"
                fontSize={14}
                component={Link}
                to={`/status/${status.id}`}
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
                <MoreVert />
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
                <MenuItem onClick={showCreateProductBatchModal}>
                  Добавить партию товаров
                </MenuItem>
                <MenuItem onClick={showCreateProductBatchGroupModal}>
                  Добавить группу
                </MenuItem>
                <MenuItem onClick={showCreateProductBatchesFromSourcesModal}>
                  Перенос товаров
                </MenuItem>
                <MenuItem onClick={showCreateProductBatchesByAssemblingModal}>
                  Собрать комбо-товары
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
