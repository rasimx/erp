import { NumberInput } from '@mantine/core';
import React, { FC, useCallback, useEffect } from 'react';

import { Product } from '../../api/product/product.gql';
import { useProductList } from '../../api/product/product.hooks';
import AutocompleteObject from '../AutocompleteObject/AutocompleteObject';
import { useFormState } from './types';

export type Props = {};

const Step_1: FC<Props> = props => {
  const { state, setState } = useFormState();

  const { items: productList } = useProductList();

  useEffect(() => {
    if (
      state.productId &&
      state.product?.id != state.productId &&
      productList.length
    ) {
      const product = productList.find(item => item.id === state.productId);
      if (product) setState(state => ({ ...state, product }));
    }
  }, [productList, state]);

  const changeProduct = useCallback(
    (product: Product | undefined) => {
      if (product) {
        setState(state => ({ ...state, productId: product.id, product }));
      } else
        setState(state => ({
          ...state,
          productId: undefined,
          product: undefined,
        }));
    },
    [setState],
  );

  const autocompleteValue = useCallback(
    (item: Product) => `${item.sku}: ${item.name}`,
    [],
  );

  return (
    <>
      <AutocompleteObject
        data={productList}
        value={state.product}
        onChange={changeProduct}
        getValue={autocompleteValue}
      />

      <NumberInput
        required
        label="Количество"
        placeholder="шт"
        allowNegative={false}
        suffix=" шт"
        decimalScale={0}
        value={state.fullCount}
        onChange={value =>
          value && setState(state => ({ ...state, fullCount: Number(value) }))
        }
        hideControls
      />
    </>
  );
};

export default Step_1;
