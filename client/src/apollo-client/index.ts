import { ApolloClient, from, HttpLink } from '@apollo/client';

import { cache } from './cache';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_APOLLO_LINK,
  headers: {},
  credentials: 'include',
});

const apolloClient = new ApolloClient({
  link: from([httpLink]),
  cache,
});

export default apolloClient;
