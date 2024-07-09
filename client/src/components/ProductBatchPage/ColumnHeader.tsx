import NiceModal, { useModal } from '@ebay/nice-modal-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useCallback } from 'react';

import { StatusFragment } from '../../gql-types/graphql';
import CreateProductBatchGroupForm from '../CreateProductBatchGroup/CreateProductBatchGroupForm';

export interface Props {
  status: StatusFragment;
}

export const ColumnHeader = React.memo<Props>(({ status }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const createGroupModal = useModal(CreateProductBatchGroupForm);
  const showCreateGroupModal = useCallback(() => {
    createGroupModal.show({
      groupStatus: status,
    });
    setAnchorEl(null);
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
        <MenuItem onClick={showCreateGroupModal}>Добавить группу</MenuItem>
      </Menu>
    </Box>
  );
});

export default ColumnHeader;
