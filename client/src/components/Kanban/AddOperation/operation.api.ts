import apolloClient from '@/apollo-client';
import { graphql } from '@/gql-types';
import {
  type CreateOperationInput,
  type CreateOperationResponse,
} from '@/gql-types/graphql';

export const CREATE_OPERATION_MUTATION = graphql(`
  mutation createOperation($input: CreateOperationInput!) {
    createOperation(input: $input) {
      success
    }
  }
`);

export const createOperation = async (
  input: CreateOperationInput,
): Promise<CreateOperationResponse | undefined> => {
  const response = await apolloClient.mutate({
    mutation: CREATE_OPERATION_MUTATION,
    variables: { input },
    fetchPolicy: 'network-only',
  });
  return response.data?.createOperation;
};

export const OPERATION_LIST_QUERY = graphql(`
  query operationList($productBatchId: Int!) {
    operationList(productBatchId: $productBatchId) {
      items {
        id
        name
      }
    }
  }
`);
// export const fetchOperationList = async (): Promise<Operation[]> => {
//   const response = await apolloClient.query({
//     query: OPERATION_LIST_QUERY,
//     fetchPolicy: 'network-only',
//   });
//   return response.data?.operationList.items ?? [];
// };
