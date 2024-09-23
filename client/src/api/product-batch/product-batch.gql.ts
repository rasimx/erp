import { FragmentType, getFragmentData, graphql } from '@/gql-types';

import { ProductBatchFragment } from '../../gql-types/graphql';
import { getProductFragment, Product } from '../product/product.gql';

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
    order
    volume
    weight
    group {
      id
      order
    }
  }
`);

export interface ProductBatch extends ProductBatchFragment {
  product: Product;
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
      product: getProductFragment(item.product),
    }));
  } else if (data) {
    const productBatch = getFragmentData(PRODUCT_BATCH_FRAGMENT, data);
    return {
      ...productBatch,
      product: getProductFragment(productBatch.product),
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

export const EDIT_PRODUCT_BATCH_MUTATION = graphql(`
  mutation editProductBatch($dto: EditProductBatchDto!) {
    editProductBatch(dto: $dto) {
      success
    }
  }
`);

export const CREATE_PRODUCT_BATCHES_BY_ASSEMBLING_MUTATION = graphql(`
  mutation createProductBatchesByAssembling(
    $dto: CreateProductBatchesByAssemblingDto!
  ) {
    createProductBatchesByAssembling(dto: $dto) {
      success
    }
  }
`);

export const CREATE_PRODUCT_BATCHES_FROM_SOURCES_MUTATION = graphql(`
  mutation createProductBatchesFromSources(
    $dto: CreateProductBatchesFromSourcesDto!
  ) {
    createProductBatchesFromSources(dto: $dto) {
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

export const EVENT_FRAGMENT = graphql(`
  fragment Event on EventDto {
    type
    data
  }
`);
