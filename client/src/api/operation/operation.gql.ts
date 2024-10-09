import { graphql } from '@/gql-types';

export const ADD_OPERATION_MUTATION = graphql(`
  mutation addOperation($dto: AddOperationDto!) {
    addOperation(dto: $dto) {
      success
    }
  }
`);

export const ADD_GROUP_OPERATION_MUTATION = graphql(`
  mutation addGroupOperation($dto: AddGroupOperationDto!) {
    addGroupOperation(dto: $dto) {
      success
    }
  }
`);
