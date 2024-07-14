import { graphql } from '@/gql-types';

export const OPERATION_FRAGMENT = graphql(`
  fragment Product on ProductDto {
    id
    name
    sku
  }
`);

export const CREATE_OPERATION_MUTATION = graphql(`
  mutation createOperation($dto: CreateOperationDto!) {
    createOperation(dto: $dto) {
      success
    }
  }
`);
