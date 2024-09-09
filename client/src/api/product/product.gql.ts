import { FragmentType, getFragmentData, graphql } from '@/gql-types';

import { ProductFragment, SetItemFragment } from '../../gql-types/graphql';

export const SET_ITEM_FRAGMENT = graphql(`
  fragment SetItem on SetItemDto {
    productId
    name
    sku
    qty
  }
`);

export const PRODUCT_FRAGMENT = graphql(`
  fragment Product on ProductDto {
    id
    name
    sku
    setItems {
      ...SetItem
    }
  }
`);

export const PRODUCT_SET_FRAGMENT = graphql(`
  fragment ProductSet on ProductDto {
    id
    name
    sku
    setItems {
      ...SetItem
    }
  }
`);

export const PRODUCT_LIST_QUERY = graphql(`
  query productList($ids: [Int!]) {
    productList(ids: $ids) {
      items {
        ...Product
      }
    }
  }
`);

export const PRODUCT_SET_LIST_QUERY = graphql(`
  query productSetList {
    productSetList {
      items {
        ...Product
      }
    }
  }
`);

export interface Product extends ProductFragment {
  setItems: SetItemFragment[];
}

export function getProductFragment(
  data: FragmentType<typeof PRODUCT_FRAGMENT> | undefined,
): Product;
export function getProductFragment(
  data: Array<FragmentType<typeof PRODUCT_FRAGMENT>> | undefined,
): Product[];
export function getProductFragment(
  data:
    | FragmentType<typeof PRODUCT_FRAGMENT>
    | Array<FragmentType<typeof PRODUCT_FRAGMENT>>
    | undefined,
) {
  if (Array.isArray(data)) {
    return getFragmentData(PRODUCT_FRAGMENT, data).map(item => ({
      ...item,
      setItems: getFragmentData(SET_ITEM_FRAGMENT, item.setItems),
    }));
  } else if (data) {
    const product = getFragmentData(PRODUCT_FRAGMENT, data);
    return {
      ...product,
      setItems: getFragmentData(SET_ITEM_FRAGMENT, product.setItems),
    };
  }
}
