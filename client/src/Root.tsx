import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { type FC } from 'react';
import { Link, Outlet } from 'react-router-dom';

const Root: FC = () => {
  return (
    <Box>
      <AppBar position="fixed">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{ color: 'inherit', textDecoration: 'none' }}
          >
            ERP
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          flexDirection: 'column',
          paddingTop: '64px',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Root;
