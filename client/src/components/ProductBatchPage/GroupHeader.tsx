import NiceModal, { useModal } from '@ebay/nice-modal-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import omit from 'lodash/omit';
import React, { useCallback } from 'react';

import { useProductBatch } from '../../api/product-batch/product-batch.hook';
import { useProductBatchGroup } from '../../api/product-batch-group/product-batch-group.hook';
import {
  ProductBatchGroupFragment,
  StatusFragment,
} from '../../gql-types/graphql';
import CreateProductBatchForm from '../CreateProductBatch/CreateProductBatchForm';
import CreateProductBatchGroupForm from '../CreateProductBatchGroup/CreateProductBatchGroupForm';

export interface Props {
  group: ProductBatchGroupFragment;
  refetch: () => void;
}

export const GroupHeader = React.memo<Props>(props => {
  const { group, refetch } = props;
  const { delteProductBatchGroup } = useProductBatchGroup();
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
        <MenuItem onClick={handleDelete}>Удалить группу</MenuItem>
      </Menu>
    </Box>
  );
});

export default GroupHeader;
