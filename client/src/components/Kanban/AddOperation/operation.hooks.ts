import { useQuery } from '@apollo/client';

import { type Query } from '@/gql-types/graphql';

import { OPERATION_LIST_QUERY } from './operation.api';

export const useOperationList = () => {
  const { data, loading } = useQuery<Pick<Query, 'operationList'>>(
    OPERATION_LIST_QUERY,
    {
      fetchPolicy: 'network-only',
    },
  );

  return { items: data?.operationList.items ?? [] };
};
