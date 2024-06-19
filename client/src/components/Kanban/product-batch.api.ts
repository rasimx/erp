import apolloClient from '@/apollo-client';
import { getFragmentData, graphql } from '@/gql-types';
import {
  CreateProductBatchInput,
  ProductBatchInStatusFragment,
  SplitProductBatchInput,
  UpdateProductBatchInput,
} from '@/gql-types/graphql';

export const PRODUCT_BATCH_LIST_QUERY = graphql(`
  query productBatchList {
    productBatchList {
      ...ProductBatchInStatus
    }
  }
`);

export const ProductBatchInStatus = graphql(`
  fragment ProductBatchInStatus on ProductBatch {
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
  }
`);

export const fetchProductBatchList = async () => {
  const response = await apolloClient.query({
    query: PRODUCT_BATCH_LIST_QUERY,
    fetchPolicy: 'network-only',
  });
  return getFragmentData(ProductBatchInStatus, response.data.productBatchList);
};

export const UPDATE_PRODUCT_BATCH_MUTATION = graphql(`
  mutation updateProductBatch($input: UpdateProductBatchInput!) {
    updateProductBatch(input: $input) {
      ...ProductBatchInStatus
    }
  }
`);

export const updateProductBatch = async (input: UpdateProductBatchInput) => {
  const response = await apolloClient.mutate({
    mutation: UPDATE_PRODUCT_BATCH_MUTATION,
    variables: { input },
    fetchPolicy: 'network-only',
  });
  return getFragmentData(
    ProductBatchInStatus,
    response.data?.updateProductBatch,
  );
};

export const CREATE_PRODUCT_BATCH_MUTATION = graphql(`
  mutation createProductBatch($input: CreateProductBatchInput!) {
    createProductBatch(input: $input) {
      ...ProductBatchInStatus
    }
  }
`);

export const createProductBatch = async (input: CreateProductBatchInput) => {
  const response = await apolloClient.mutate({
    mutation: CREATE_PRODUCT_BATCH_MUTATION,
    variables: { input },
    fetchPolicy: 'network-only',
  });
  return getFragmentData(
    ProductBatchInStatus,
    response.data?.createProductBatch,
  );
};

export const DELETE_PRODUCT_BATCH_MUTATION = graphql(`
  mutation deleteProductBatch($id: Int!) {
    deleteProductBatch(id: $id)
  }
`);

export const deleteProductBatch = async (id: number) => {
  const response = await apolloClient.mutate({
    mutation: DELETE_PRODUCT_BATCH_MUTATION,
    variables: { id },
    fetchPolicy: 'network-only',
  });
  return response.data?.deleteProductBatch;
};

export const SPLIT_PRODUCT_BATCH_MUTATION = graphql(`
  mutation splitProductBatch($input: SplitProductBatchInput!) {
    splitProductBatch(input: $input) {
      newItems {
        ...ProductBatchInStatus
      }
    }
  }
`);

export const splitProductBatch = async (input: SplitProductBatchInput) => {
  const response = await apolloClient.mutate({
    mutation: SPLIT_PRODUCT_BATCH_MUTATION,
    variables: { input },
    fetchPolicy: 'network-only',
  });
  return getFragmentData(
    ProductBatchInStatus,
    response.data?.splitProductBatch.newItems,
  );
};

// export const MERGE_PRODUCT_BATCH_MUTATION = gql`
//   mutation mergeProductBatch($input: MergeProductBatchInput!) {
//     mergeProductBatch(input: $input) {
//       productBatch {
//         id
//         product {
//           sku
//           name
//         }
//         statusId
//         count
//         pricePerUnit
//         costPrice
//         fullPrice
//         date
//         weight
//         volume
//       }
//     }
//   }
// `;
//
// export const mergeProductBatch = async (
//   input: MutationMergeProductBatchArgs['input'],
// ) => {
//   const response = await apolloClient.mutate<
//     Pick<Mutation, 'mergeProductBatch'>
//   >({
//     mutation: MERGE_PRODUCT_BATCH_MUTATION,
//     variables: { input },
//     fetchPolicy: 'network-only',
//   });
//   return response.data?.mergeProductBatch;
// };
