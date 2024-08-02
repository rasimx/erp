import { FragmentType, getFragmentData, graphql } from '@/gql-types';

import { ProductBatchGroupFragment } from '../../gql-types/graphql';
import {
  getProductBatchFragment,
  ProductBatch,
} from '../product-batch/product-batch.gql';

export const PRODUCT_BATCH_GROUP_FRAGMENT = graphql(`
  fragment ProductBatchGroup on ProductBatchGroupDto {
    id
    name
    statusId
    status {
      id
      title
      order
    }
    order
    productBatchList {
      ...ProductBatch
    }
  }
`);

export interface ProductBatchGroup extends ProductBatchGroupFragment {
  productBatchList: ProductBatch[];
}

export function getProductBatchGroupFragment(
  data: FragmentType<typeof PRODUCT_BATCH_GROUP_FRAGMENT> | undefined,
): ProductBatchGroup;
export function getProductBatchGroupFragment(
  data: Array<FragmentType<typeof PRODUCT_BATCH_GROUP_FRAGMENT>> | undefined,
): ProductBatchGroup[];
export function getProductBatchGroupFragment(
  data:
    | FragmentType<typeof PRODUCT_BATCH_GROUP_FRAGMENT>
    | Array<FragmentType<typeof PRODUCT_BATCH_GROUP_FRAGMENT>>
    | undefined,
) {
  if (Array.isArray(data)) {
    return getFragmentData(PRODUCT_BATCH_GROUP_FRAGMENT, data).map(item => ({
      ...item,
      productBatchList: getProductBatchFragment(item.productBatchList),
    }));
  } else if (data) {
    const productBatchGroup = getFragmentData(
      PRODUCT_BATCH_GROUP_FRAGMENT,
      data,
    );
    return {
      ...productBatchGroup,
      productBatchList: getProductBatchFragment(
        productBatchGroup.productBatchList,
      ),
    };
  }
}

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
      success
    }
  }
`);

export const DELETE_PRODUCT_BATCH_GROUP_MUTATION = graphql(`
  mutation deleteProductBatchGroup($id: Int!) {
    deleteProductBatchGroup(id: $id) {
      success
    }
  }
`);
