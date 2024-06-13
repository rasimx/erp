import { gql } from '@apollo/client';

import apolloClient from '../../apollo-client';
import {
  type Mutation,
  type MutationCreateProductBatchArgs,
  MutationSplitProductBatchArgs,
  type MutationUpdateProductBatchArgs,
  type ProductBatch,
  type Query,
} from '../../gql-types/graphql';

export const PRODUCT_BATCH_LIST_QUERY = gql`
  query productBatchList {
    productBatchList {
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
  }
`;

export const fetchProductBatchList = async (): Promise<ProductBatch[]> => {
  const response = await apolloClient.query<Pick<Query, 'productBatchList'>>({
    query: PRODUCT_BATCH_LIST_QUERY,
    fetchPolicy: 'network-only',
  });
  return response.data.productBatchList;
};

export const UPDATE_PRODUCT_BATCH_MUTATION = gql`
  mutation updateProductBatch($input: UpdateProductBatchInput!) {
    updateProductBatch(input: $input) {
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
  }
`;

export const updateProductBatch = async (
  input: MutationUpdateProductBatchArgs['input'],
) => {
  const response = await apolloClient.mutate<
    Pick<Mutation, 'updateProductBatch'>
  >({
    mutation: UPDATE_PRODUCT_BATCH_MUTATION,
    variables: { input },
    fetchPolicy: 'network-only',
  });
  return response.data?.updateProductBatch;
};

export const CREATE_PRODUCT_BATCH_MUTATION = gql`
  mutation createProductBatch($input: CreateProductBatchInput!) {
    createProductBatch(input: $input) {
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
  }
`;

export const createProductBatch = async (
  input: MutationCreateProductBatchArgs['input'],
) => {
  const response = await apolloClient.mutate<
    Pick<Mutation, 'createProductBatch'>
  >({
    mutation: CREATE_PRODUCT_BATCH_MUTATION,
    variables: { input },
    fetchPolicy: 'network-only',
  });
  return response.data?.createProductBatch;
};

export const DELETE_PRODUCT_BATCH_MUTATION = gql`
  mutation deleteProductBatch($id: Int!) {
    deleteProductBatch(id: $id)
  }
`;

export const deleteProductBatch = async (id: number) => {
  const response = await apolloClient.mutate<
    Pick<Mutation, 'deleteProductBatch'>
  >({
    mutation: DELETE_PRODUCT_BATCH_MUTATION,
    variables: { id },
    fetchPolicy: 'network-only',
  });
  return response.data?.deleteProductBatch;
};

export const SPLIT_PRODUCT_BATCH_MUTATION = gql`
  mutation splitProductBatch($input: SplitProductBatchInput!) {
    splitProductBatch(input: $input) {
      newItems {
        id
        name
        product {
          sku
          name
        }
        statusId
        count
        pricePerUnit
        costPrice
        fullPrice
        date
        weight
        volume
      }
    }
  }
`;

export const splitProductBatch = async (
  input: MutationSplitProductBatchArgs['input'],
) => {
  const response = await apolloClient.mutate<
    Pick<Mutation, 'splitProductBatch'>
  >({
    mutation: SPLIT_PRODUCT_BATCH_MUTATION,
    variables: { input },
    fetchPolicy: 'network-only',
  });
  return response.data?.splitProductBatch;
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
