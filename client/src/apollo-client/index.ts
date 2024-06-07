import { ApolloClient, from, HttpLink } from '@apollo/client';

import { cache } from './cache';

const httpLink = new HttpLink({
  uri: 'https://localhost:3004/graphql',
  // uri: 'https://192.168.0.2:13020/graphql',
  headers: {},
  credentials: 'include',
});

const apolloClient = new ApolloClient({
  link: from([httpLink]),
  cache,
});

export default apolloClient;
