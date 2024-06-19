import apolloClient from '@/apollo-client';
import { graphql } from '@/gql-types';
import { type Status } from '@/gql-types/graphql';

export const STATUS_LIST_QUERY = graphql(`
  query statusList {
    statusList {
      id
      title
    }
  }
`);
export const fetchStatusList = async (): Promise<Status[]> => {
  const response = await apolloClient.query({
    query: STATUS_LIST_QUERY,
    fetchPolicy: 'network-only',
  });
  return response.data.statusList;
};

export const CREATE_STATUS_MUTATION = graphql(`
  mutation createStatus($title: String!) {
    createStatus(title: $title) {
      id
      title
    }
  }
`);
export const createStatus = async (title: string): Promise<Status[]> => {
  const response = await apolloClient.mutate({
    mutation: CREATE_STATUS_MUTATION,
    variables: { title },
    fetchPolicy: 'network-only',
  });
  return response.data?.createStatus ?? [];
};

export const DELETE_STATUS_MUTATION = graphql(`
  mutation deleteStatus($id: Int!) {
    deleteStatus(id: $id) {
      id
      title
    }
  }
`);
export const deleteStatus = async (id: number): Promise<Status[]> => {
  const response = await apolloClient.mutate({
    mutation: DELETE_STATUS_MUTATION,
    variables: { id },
    fetchPolicy: 'network-only',
  });
  return response.data?.deleteStatus ?? [];
};
