import apolloClient from '../../apollo-client';
import { CreateProductBatchGroupDto } from '../../gql-types/graphql';
import { CREATE_PRODUCT_BATCH_GROUP_MUTATION } from './product-batch-group.gql';

export const createProductBatchGroup = async (
  dto: CreateProductBatchGroupDto,
) => {
  const response = await apolloClient.mutate({
    mutation: CREATE_PRODUCT_BATCH_GROUP_MUTATION,
    fetchPolicy: 'network-only',
    variables: { dto },
  });
  return response.data?.createProductBatchGroup;
};
