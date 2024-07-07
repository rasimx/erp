import { graphql } from '@/gql-types';

export const PRODUCT_BATCH_GROUP_FRAGMENT = graphql(`
  fragment ProductBatchGroup on ProductBatchGroupDto {
    id
    name
    statusId
    order
    productBatchList {
      ...ProductBatch
    }
  }
`);

export const MOVE_PRODUCT_BATCH_GROUP_MUTATION = graphql(`
  mutation moveProductBatchGroup($dto: MoveProductBatchGroupDto!) {
    moveProductBatchGroup(dto: $dto) {
      success
    }
  }
`);

export const CREATE_PRODUCT_BATCH_GROUP_MUTATION = graphql(`
  mutation createProductBatchGroup($dto: CreateProductBatchGroupDto!) {
    createProductBatchGroup(dto: $dto) {
      ...ProductBatchGroup
    }
  }
`);

export const DELETE_PRODUCT_BATCH_GROUP_MUTATION = graphql(`
  mutation deleteProductBatchGroup($id: Int!) {
    deleteProductBatchGroup(id: $id)
  }
`);
