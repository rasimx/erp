import { graphql } from '@/gql-types';

export const PRODUCT_BATCH_LIST_QUERY = graphql(`
  query productBatchList($dto: GetProductBatchListDto!) {
    productBatchList(dto: $dto) {
      ...ProductBatch
    }
  }
`);

export const PRODUCT_BATCH_FRAGMENT = graphql(`
  fragment ProductBatch on ProductBatchDto {
    id
    name
    groupId
    productId
    product {
      ...Product
    }
    parentId
    statusId
    status {
      id
      title
      order
    }
    count
    costPricePerUnit
    operationsPricePerUnit
    date
    order
    volume
    weight
    color
    group {
      id
      order
    }
  }
`);

export const MOVE_PRODUCT_BATCH_MUTATION = graphql(`
  mutation moveProductBatch($dto: MoveProductBatchDto!) {
    moveProductBatch(dto: $dto) {
      success
    }
  }
`);

export const CREATE_PRODUCT_BATCH_MUTATION = graphql(`
  mutation createProductBatch($dto: CreateProductBatchDto!) {
    createProductBatch(dto: $dto) {
      success
    }
  }
`);

export const DELETE_PRODUCT_BATCH_MUTATION = graphql(`
  mutation deleteProductBatch($id: Int!) {
    deleteProductBatch(id: $id) {
      success
    }
  }
`);
