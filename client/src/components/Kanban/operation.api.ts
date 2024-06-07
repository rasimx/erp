import { gql } from '@apollo/client';

import apolloClient from '../../apollo-client';
import {
  type CreateOperationResponse,
  type Mutation,
  type MutationCreateOperationArgs,
  type Operation,
  type Query,
} from '../../gql-types/graphql';

export const CREATE_OPERATION_MUTATION = gql`
  mutation createOperation($input: CreateOperationInput!) {
    createOperation(input: $input) {
      success
    }
  }
`;

export const createOperation = async (
  input: MutationCreateOperationArgs['input'],
): Promise<CreateOperationResponse | undefined> => {
  const response = await apolloClient.mutate<Pick<Mutation, 'createOperation'>>(
    {
      mutation: CREATE_OPERATION_MUTATION,
      variables: { input },
      fetchPolicy: 'network-only',
    },
  );
  return response.data?.createOperation;
};

export const OPERATION_LIST_QUERY = gql`
  query operationList($productBatchId: Int!) {
    operationList(productBatchId: $productBatchId) {
      items {
        id
        name
      }
    }
  }
`;
export const fetchOperationList = async (): Promise<Operation[]> => {
  const response = await apolloClient.query<Pick<Query, 'operationList'>>({
    query: OPERATION_LIST_QUERY,
    fetchPolicy: 'network-only',
  });
  return response.data?.operationList.items ?? [];
};
