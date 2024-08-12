import {
  AppBar,
  Box,
  Button,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

export const RootBar = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <AppBar position="fixed">
      <Toolbar variant="dense">
        <Typography
          variant="h6"
          noWrap
          component={Link}
          to="/"
          sx={{ color: 'inherit', textDecoration: 'none' }}
        >
          ERP
        </Typography>
        <Button
          id="basic-button"
          onClick={handleClick}
          sx={{ color: 'inherit', ml: 4 }}
        >
          Меню
        </Button>
        <Box sx={{ flexGrow: 1 }} />
      </Toolbar>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem component={Link} to="/batch" onClick={handleClose}>
          Партии
        </MenuItem>
      </Menu>
    </AppBar>
  );
};
