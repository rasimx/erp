declare module 'remoteOzon/App' {
  export default FC<{ basename: string }>;
}
declare module 'remoteOzon/apolloClient' {
  import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
  export default new ApolloClient<NormalizedCacheObject>();
}
declare module 'remoteOzon/full-state.api' {
  import { Scalars } from './src/gql-types/graphql';

  export type FullStateDto = {
    __typename?: 'FullStateDto';
    baseProductId: Scalars['Int']['output'];
    inStoreCount: Scalars['Int']['output'];
    linkedSales: Array<LinkedSalesDto>;
    unlinkedSalesCount: Scalars['Int']['output'];
  };

  export type FullStateDtoFragment = {
    __typename?: 'FullStateDto';
    baseProductId: number;
    inStoreCount: number;
    unlinkedSalesCount: number;
    linkedSales: Array<{
      __typename?: 'LinkedSalesDto';
      productBatchId: number;
      count: number;
    }>;
  } & { ' $fragmentName'?: 'FullStateDtoFragment' };

  export type GetFullStateDto = {
    items: Array<GetFullStateItemDto>;
    storeId: Scalars['Int']['input'];
  };

  export type GetFullStateItemDto = {
    baseProductId: Scalars['Int']['input'];
    fromProductBatchId?: InputMaybe<Scalars['Int']['input']>;
  };

  export type LinkedSalesDto = {
    __typename?: 'LinkedSalesDto';
    count: Scalars['Int']['output'];
    productBatchId: Scalars['Int']['output'];
  };
  export function fetchFullState(
    dto: GetFullStateDto,
  ): Promise<FullStateDtoFragment[]>;
}

declare module 'remoteLocal/*' {
  import { FC } from 'react';
  export const App: FC<{ basename: string }>;
}
