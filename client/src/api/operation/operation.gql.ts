import { graphql } from '@/gql-types';

export const CREATE_OPERATION_MUTATION = graphql(`
  mutation createOperation($dto: CreateOperationDto!) {
    createOperation(dto: $dto) {
      success
    }
  }
`);
