import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

import { ApolloProvider } from '@apollo/client';
import NiceModal from '@ebay/nice-modal-react';
import CssBaseline from '@mui/material/CssBaseline';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { SnackbarProvider } from 'notistack';
import { PrimeReactProvider } from 'primereact/api';
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

// const theme = createTheme({
//   components: {
//     MuiCssBaseline: {
//       styleOverrides: {
//         body: {
//           boxSizing: 'border-box',
//         },
//         '*, *::before, *::after': {
//           boxSizing: 'inherit',
//         },
//       },
//     },
//   },
// });

const App: FC<Props> = ({ basename }) => {
  return (
    <ApolloProvider client={apolloClient}>
      <CookiesProvider defaultSetOptions={{ path: '/graphql' }}>
        <SnackbarProvider maxSnack={3}>
          <ReduxProvider store={reduxStore}>
            {/*<ThemeProvider theme={theme}>*/}
            <PrimeReactProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <NiceModal.Provider>
                  <CssBaseline />
                  <RouterProvider router={createRouter(basename)} />
                </NiceModal.Provider>
              </LocalizationProvider>
              {/*</ThemeProvider>*/}
            </PrimeReactProvider>
          </ReduxProvider>
        </SnackbarProvider>
      </CookiesProvider>
    </ApolloProvider>
  );
};

export default App;
