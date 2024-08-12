import Box from '@mui/material/Box';
import React, { type FC } from 'react';
import { Outlet } from 'react-router-dom';

import { RootBar } from './RootBar';

const Root: FC = () => {
  return (
    <Box>
      <RootBar />
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
