import { FragmentType, getFragmentData, graphql } from '@/gql-types';

import {
  EventFragment,
  OperationFragment,
  ProductBatchDetailFragment,
} from '../../gql-types/graphql';
import { getProductFragment, Product } from '../product/product.gql';

export interface ProductBatchDetail extends ProductBatchDetailFragment {
  product: Product;
  events: EventFragment[];
  operations: OperationFragment[];
}

export const EVENT_FRAGMENT = graphql(`
  fragment Event on EventDto {
    type
    data
  }
`);

export const OPERATION_FRAGMENT = graphql(`
  fragment Operation on OperationDto {
    id
    name
    cost
    date
    proportionType
    createdAt
  }
`);

export const PRODUCT_BATCH_DETAIL_FRAGMENT = graphql(`
  fragment ProductBatchDetail on ProductBatchDetailDto {
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
    operations {
      ...Operation
    }
    events {
      ...Event
    }
  }
`);

export const PRODUCT_BATCH_DETAIL_QUERY = graphql(`
  query productBatchDetail($id: Int!) {
    productBatchDetail(id: $id) {
      ...ProductBatchDetail
    }
  }
`);

export function getProductBatchDetailFragment(
  data: FragmentType<typeof PRODUCT_BATCH_DETAIL_FRAGMENT> | undefined,
): ProductBatchDetail;
export function getProductBatchDetailFragment(
  data: Array<FragmentType<typeof PRODUCT_BATCH_DETAIL_FRAGMENT>> | undefined,
): ProductBatchDetail[];
export function getProductBatchDetailFragment(
  data:
    | FragmentType<typeof PRODUCT_BATCH_DETAIL_FRAGMENT>
    | Array<FragmentType<typeof PRODUCT_BATCH_DETAIL_FRAGMENT>>
    | undefined,
) {
  if (Array.isArray(data)) {
    return getFragmentData(PRODUCT_BATCH_DETAIL_FRAGMENT, data).map(item => ({
      ...item,
      product: getProductFragment(item.product),
      events: getFragmentData(EVENT_FRAGMENT, item.events),
      operations: getFragmentData(OPERATION_FRAGMENT, item.operations),
    }));
  } else if (data) {
    const productBatch = getFragmentData(PRODUCT_BATCH_DETAIL_FRAGMENT, data);
    return {
      ...productBatch,
      product: getProductFragment(productBatch.product),
      events: getFragmentData(EVENT_FRAGMENT, productBatch.events),
      operations: getFragmentData(OPERATION_FRAGMENT, productBatch.operations),
    };
  }
}
