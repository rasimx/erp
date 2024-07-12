import NiceModal, { useModal } from '@ebay/nice-modal-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import omit from 'lodash/omit';
import React, { useCallback } from 'react';

import { useProductBatch } from '../../api/product-batch/product-batch.hook';
import { useProductBatchGroup } from '../../api/product-batch-group/product-batch-group.hook';
import { StatusFragment } from '../../gql-types/graphql';
import CreateProductBatchForm from '../CreateProductBatch/CreateProductBatchForm';
import CreateProductBatchGroupForm from '../CreateProductBatchGroup/CreateProductBatchGroupForm';

export interface Props {
  status: StatusFragment;
  refetch: () => void;
}

export const ColumnHeader = React.memo<Props>(props => {
  const { createProductBatchGroup } = useProductBatchGroup();
  const { createProductBatch } = useProductBatch();
  const { status, refetch } = props;
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
          dto: { ...omit(values, ['product']), productId: values.product.id },
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
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography
        id="modal-modal-title"
        variant="h6"
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
  );
});

export default ColumnHeader;
