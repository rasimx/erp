import { FragmentType, getFragmentData, graphql } from '@/gql-types';

import {
  EventFragment,
  ProductBatchGroupDetailFragment,
} from '../../gql-types/graphql';
import {
  getProductBatchFragment,
  ProductBatch,
} from '../product-batch/product-batch.gql';
import { EVENT_FRAGMENT } from '../product-batch/product-batch-detail.gql';

export const PRODUCT_BATCH_GROUP_DETAIL_FRAGMENT = graphql(`
  fragment ProductBatchGroupDetail on ProductBatchGroupDetailDto {
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
    events {
      ...Event
    }
  }
`);

export const PRODUCT_BATCH_GROUP_DETAIL_QUERY = graphql(`
  query productBatchGroupDetail($id: Int!) {
    productBatchGroupDetail(id: $id) {
      ...ProductBatchGroupDetail
    }
  }
`);

export interface ProductBatchGroupDetail
  extends ProductBatchGroupDetailFragment {
  productBatchList: ProductBatch[];
  events: EventFragment[];
}

export function getProductBatchGroupDetailFragment(
  data: FragmentType<typeof PRODUCT_BATCH_GROUP_DETAIL_FRAGMENT> | undefined,
): ProductBatchGroupDetail;
export function getProductBatchGroupDetailFragment(
  data:
    | Array<FragmentType<typeof PRODUCT_BATCH_GROUP_DETAIL_FRAGMENT>>
    | undefined,
): ProductBatchGroupDetail[];
export function getProductBatchGroupDetailFragment(
  data:
    | FragmentType<typeof PRODUCT_BATCH_GROUP_DETAIL_FRAGMENT>
    | Array<FragmentType<typeof PRODUCT_BATCH_GROUP_DETAIL_FRAGMENT>>
    | undefined,
) {
  if (Array.isArray(data)) {
    return getFragmentData(PRODUCT_BATCH_GROUP_DETAIL_FRAGMENT, data).map(
      item => ({
        ...item,
        productBatchList: getProductBatchFragment(item.productBatchList),
        events: getFragmentData(EVENT_FRAGMENT, item.events),
      }),
    );
  } else if (data) {
    const productBatchGroup = getFragmentData(
      PRODUCT_BATCH_GROUP_DETAIL_FRAGMENT,
      data,
    );
    return {
      ...productBatchGroup,
      events: getFragmentData(EVENT_FRAGMENT, productBatchGroup.events),
      productBatchList: getProductBatchFragment(
        productBatchGroup.productBatchList,
      ),
    };
  }
}
