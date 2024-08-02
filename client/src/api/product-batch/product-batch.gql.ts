import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';

import {
  DocumentType,
  FragmentType,
  getFragmentData,
  graphql,
} from '@/gql-types';

import { ProductBatchFragment, ProductFragment } from '../../gql-types/graphql';
import { PRODUCT_FRAGMENT } from '../product/product.gql';

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

export interface ProductBatch extends ProductBatchFragment {
  product: ProductFragment;
}

export function getProductBatchFragment(
  data: FragmentType<typeof PRODUCT_BATCH_FRAGMENT> | undefined,
): ProductBatch;
export function getProductBatchFragment(
  data: Array<FragmentType<typeof PRODUCT_BATCH_FRAGMENT>> | undefined,
): ProductBatch[];
export function getProductBatchFragment(
  data:
    | FragmentType<typeof PRODUCT_BATCH_FRAGMENT>
    | Array<FragmentType<typeof PRODUCT_BATCH_FRAGMENT>>
    | undefined,
) {
  if (Array.isArray(data)) {
    return getFragmentData(PRODUCT_BATCH_FRAGMENT, data).map(item => ({
      ...item,
      product: getFragmentData(PRODUCT_FRAGMENT, item.product),
    }));
  } else if (data) {
    const productBatch = getFragmentData(PRODUCT_BATCH_FRAGMENT, data);
    return {
      ...productBatch,
      product: getFragmentData(PRODUCT_FRAGMENT, productBatch.product),
    };
  }
}

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
