import apolloClient from '@/apollo-client';
import {
  MoveStatusMutationVariables,
  StatusFragment,
} from '@/gql-types/graphql';

import { getFragmentData } from '../../gql-types';
import {
  CREATE_STATUS_MUTATION,
  DELETE_STATUS_MUTATION,
  MOVE_STATUS_MUTATION,
  STATUS_FRAGMENT,
  STATUS_LIST_QUERY,
} from './status.gql';

export const fetchStatusList = async (): Promise<StatusFragment[]> => {
  const response = await apolloClient.query({
    query: STATUS_LIST_QUERY,
    fetchPolicy: 'network-only',
  });
  return getFragmentData(
    STATUS_FRAGMENT,
    response.data.statusList,
  ) as StatusFragment[];
};

export const moveStatusMutation = async ({
  id,
  order,
}: MoveStatusMutationVariables) => {
  const response = await apolloClient.mutate({
    mutation: MOVE_STATUS_MUTATION,
    variables: { id, order },
    fetchPolicy: 'network-only',
  });
  return getFragmentData(STATUS_FRAGMENT, response.data?.moveStatus);
};

export const createStatus = async (title: string) => {
  const response = await apolloClient.mutate({
    mutation: CREATE_STATUS_MUTATION,
    variables: { title },
    fetchPolicy: 'network-only',
  });
  return getFragmentData(STATUS_FRAGMENT, response.data?.createStatus);
};

export const deleteStatus = async (id: number): Promise<StatusFragment[]> => {
  const response = await apolloClient.mutate({
    mutation: DELETE_STATUS_MUTATION,
    variables: { id },
    fetchPolicy: 'network-only',
  });
  // @ts-expect-error .......
  return response.data?.deleteStatus ?? [];
};
