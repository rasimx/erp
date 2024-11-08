import './App.scss';
import 'primereact/resources/themes/rhea/theme.css';
import 'primeicons/primeicons.css';

import { ApolloProvider } from '@apollo/client';
import NiceModal from '@ebay/nice-modal-react';
import { SnackbarProvider } from 'notistack';
import { PrimeReactProvider } from 'primereact/api';
import { ConfirmDialog } from 'primereact/confirmdialog';
import React, { FC } from 'react';
import { CookiesProvider } from 'react-cookie';
import { Provider as ReduxProvider } from 'react-redux';
import { Outlet } from 'react-router-dom';

import apolloClient from '../../apollo-client';
import reduxStore from '../../redux-store';
import { AppBar } from '../AppBar/AppBar';
import classes from './App.module.scss';
import { AppProvider } from './AppContext';

type Props = {
  basename?: string;
};

const App: FC<Props> = props => {
  const { basename } = props;
  return (
    <AppProvider value={{ basename }}>
      <ApolloProvider client={apolloClient}>
        <CookiesProvider defaultSetOptions={{ path: '/graphql' }}>
          <SnackbarProvider maxSnack={3}>
            <ReduxProvider store={reduxStore}>
              <PrimeReactProvider>
                <NiceModal.Provider>
                  <div className={classes.root}>
                    <AppBar />
                    <main className={classes.main}>
                      <Outlet />
                    </main>

                    <ConfirmDialog />
                  </div>
                </NiceModal.Provider>
              </PrimeReactProvider>
            </ReduxProvider>
          </SnackbarProvider>
        </CookiesProvider>
      </ApolloProvider>
    </AppProvider>
  );
};

export default App;
