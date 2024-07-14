import { graphql } from '@/gql-types';

export const PRODUCT_BATCH_LIST_QUERY = graphql(`
  query productBatchList($productId: Int) {
    productBatchList(productId: $productId) {
      ...ProductBatch
    }
    productBatchGroupList(productId: $productId) {
      ...ProductBatchGroup
    }
  }
`);

export const PRODUCT_BATCH_FRAGMENT = graphql(`
  fragment ProductBatch on ProductBatchDto {
    id
    name
    groupId
    product {
      sku
      name
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
  mutation createProductBatch(
    $dto: CreateProductBatchDto!
    $statusId: Int
    $groupId: Int
  ) {
    createProductBatch(dto: $dto, statusId: $statusId, groupId: $groupId) {
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
