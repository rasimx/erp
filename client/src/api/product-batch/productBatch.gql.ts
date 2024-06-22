import { graphql } from '@/gql-types';

export const PRODUCT_BATCH_LIST_QUERY = graphql(`
  query productBatchList {
    productBatchList {
      ...ProductBatch
    }
  }
`);

export const PRODUCT_BATCH_FRAGMENT = graphql(`
  fragment ProductBatch on ProductBatch {
    id
    name
    product {
      sku
      name
    }
    parentId
    statusId
    count
    pricePerUnit
    costPrice
    fullPrice
    date
    weight
    volume
    order
  }
`);

export const UPDATE_PRODUCT_BATCH_MUTATION = graphql(`
  mutation updateProductBatch($input: UpdateProductBatchInput!) {
    updateProductBatch(input: $input) {
      ...ProductBatch
    }
  }
`);

export const CREATE_PRODUCT_BATCH_MUTATION = graphql(`
  mutation createProductBatch($input: CreateProductBatchInput!) {
    createProductBatch(input: $input) {
      ...ProductBatch
    }
  }
`);

export const DELETE_PRODUCT_BATCH_MUTATION = graphql(`
  mutation deleteProductBatch($id: Int!) {
    deleteProductBatch(id: $id)
  }
`);
