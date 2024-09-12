import './App.scss';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/core/styles/ModalBase.css';

import { ApolloProvider } from '@apollo/client';
import NiceModal from '@ebay/nice-modal-react';
import { createTheme, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { SnackbarProvider } from 'notistack';
import React, { FC } from 'react';
import { CookiesProvider } from 'react-cookie';
import { Provider as ReduxProvider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import apolloClient from './apollo-client';
import reduxStore from './redux-store';
import { createRouter } from './router';

type Props = {
  basename?: string;
};

const theme = createTheme({
  primaryColor: 'cyan',
});

const App: FC<Props> = ({ basename }) => {
  return (
    <ApolloProvider client={apolloClient}>
      <CookiesProvider defaultSetOptions={{ path: '/graphql' }}>
        <SnackbarProvider maxSnack={3}>
          <ReduxProvider store={reduxStore}>
            <MantineProvider theme={theme}>
              <ModalsProvider>
                <NiceModal.Provider>
                  <RouterProvider router={createRouter(basename)} />
                </NiceModal.Provider>
              </ModalsProvider>
            </MantineProvider>
          </ReduxProvider>
        </SnackbarProvider>
      </CookiesProvider>
    </ApolloProvider>
  );
};

export default App;
