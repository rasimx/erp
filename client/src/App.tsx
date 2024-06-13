import { ApolloProvider } from '@apollo/client';
import { createTheme, ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import React, { FC } from 'react';
import { CookiesProvider } from 'react-cookie';
import { Provider as ReduxProvider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import apolloClient from './apollo-client';
import { createRouter } from './router';
import store from './store';

type Props = {
  basename?: string;
};

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          boxSizing: 'border-box',
        },
        '*, *::before, *::after': {
          boxSizing: 'inherit',
        },
      },
    },
  },
});

const App: FC<Props> = ({ basename }) => {
  return (
    <ApolloProvider client={apolloClient}>
      <CookiesProvider defaultSetOptions={{ path: '/graphql' }}>
        <SnackbarProvider maxSnack={3}>
          <ReduxProvider store={store}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <RouterProvider router={createRouter(basename)} />
            </ThemeProvider>
          </ReduxProvider>
        </SnackbarProvider>
      </CookiesProvider>
    </ApolloProvider>
  );
};

export default App;
