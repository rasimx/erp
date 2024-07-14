import { useModal } from '@ebay/nice-modal-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useCallback } from 'react';

import { useOperation } from '../../api/operation/operation.hooks';
import { PRODUCT_BATCH_FRAGMENT } from '../../api/product-batch/product-batch.gql';
import { useProductBatchGroup } from '../../api/product-batch-group/product-batch-group.hook';
import { getFragmentData } from '../../gql-types';
import { ProductBatchGroupFragment } from '../../gql-types/graphql';
import OperationForm from '../OperationForm/OperationForm';

export interface Props {
  group: ProductBatchGroupFragment;
  refetch: () => void;
}

export const GroupHeader = React.memo<Props>(props => {
  const { group, refetch } = props;

  const { delteProductBatchGroup } = useProductBatchGroup();
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
    delteProductBatchGroup(group.id).then(() => {
      handleClose();
      refetch();
    });
  };

  const operationFormModal = useModal(OperationForm);
  const showOperationFormModal = useCallback(() => {
    operationFormModal.show({
      groupId: group.id,
      productBatches: getFragmentData(
        PRODUCT_BATCH_FRAGMENT,
        group.productBatchList,
      ),
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
  }, [handleClose, group]);

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
        {group.name}
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
        <MenuItem onClick={showOperationFormModal}>Добавить операцию</MenuItem>
        <MenuItem onClick={handleDelete}>Удалить группу</MenuItem>
      </Menu>
    </Box>
  );
});

export default GroupHeader;
