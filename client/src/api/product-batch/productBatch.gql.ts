import { graphql } from '@/gql-types';

export const PRODUCT_BATCH_LIST_QUERY = graphql(`
  query productBatchList($productId: Int!) {
    productBatchList(productId: $productId) {
      ...ProductBatch
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
    count
    costPricePerUnit
    operationsPricePerUnit
    date
    order
  }
`);

export const MOVE_PRODUCT_BATCH_MUTATION = graphql(`
  mutation moveProductBatch($dto: MoveProductBatchDto!) {
    moveProductBatch(dto: $dto) {
      ...ProductBatch
    }
  }
`);

export const CREATE_PRODUCT_BATCH_MUTATION = graphql(`
  mutation createProductBatch($dto: CreateProductBatchDto!) {
    createProductBatch(dto: $dto) {
      ...ProductBatch
    }
  }
`);

export const DELETE_PRODUCT_BATCH_MUTATION = graphql(`
  mutation deleteProductBatch($id: Int!) {
    deleteProductBatch(id: $id)
  }
`);
