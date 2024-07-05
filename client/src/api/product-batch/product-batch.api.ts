import apolloClient from '@/apollo-client';
import { getFragmentData, graphql } from '@/gql-types';
import {
  CreateProductBatchInput,
  UpdateProductBatchInput,
} from '@/gql-types/graphql';

import {
  CREATE_PRODUCT_BATCH_MUTATION,
  DELETE_PRODUCT_BATCH_MUTATION,
  MOVE_PRODUCT_BATCH_MUTATION,
  PRODUCT_BATCH_FRAGMENT,
  PRODUCT_BATCH_LIST_QUERY,
} from './productBatch.gql';

export const fetchProductBatchList = async () => {
  const response = await apolloClient.query({
    query: PRODUCT_BATCH_LIST_QUERY,
    fetchPolicy: 'network-only',
  });
  return getFragmentData(
    PRODUCT_BATCH_FRAGMENT,
    response.data.productBatchList,
  );
};

export const updateProductBatch = async (input: UpdateProductBatchInput) => {
  const response = await apolloClient.mutate({
    mutation: MOVE_PRODUCT_BATCH_MUTATION,
    variables: { input },
    fetchPolicy: 'network-only',
  });
  return getFragmentData(
    PRODUCT_BATCH_FRAGMENT,
    response.data?.updateProductBatch,
  );
};

export const createProductBatch = async (input: CreateProductBatchInput) => {
  const response = await apolloClient.mutate({
    mutation: CREATE_PRODUCT_BATCH_MUTATION,
    variables: { input },
    fetchPolicy: 'network-only',
  });
  return getFragmentData(
    PRODUCT_BATCH_FRAGMENT,
    response.data?.createProductBatch,
  );
};

export const deleteProductBatch = async (id: number) => {
  const response = await apolloClient.mutate({
    mutation: DELETE_PRODUCT_BATCH_MUTATION,
    variables: { id },
    fetchPolicy: 'network-only',
  });
  return response.data?.deleteProductBatch;
};
