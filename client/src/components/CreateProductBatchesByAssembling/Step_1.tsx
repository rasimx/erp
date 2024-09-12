import { NumberInput } from '@mantine/core';
import React, { FC, useCallback, useEffect } from 'react';

import { Product } from '../../api/product/product.gql';
import { useProductSetList } from '../../api/product/product.hooks';
import AutocompleteObject from '../AutocompleteObject/AutocompleteObject';
import { useFormState } from './types';

export type Props = {};

const Step_1: FC<Props> = props => {
  const { state, setState } = useFormState();

  const { items: productList } = useProductSetList();

  useEffect(() => {
    if (
      state.productSetId &&
      state.productSet?.id != state.productSetId &&
      productList.length
    ) {
      const productSet = productList.find(
        item => item.id === state.productSetId,
      );
      if (productSet) setState(state => ({ ...state, productSet }));
    }
  }, [productList, state]);

  const changeProduct = useCallback(
    (productSet: Product | undefined) => {
      if (productSet) {
        setState(state => ({
          ...state,
          productSetId: productSet.id,
          productSet,
        }));
      } else
        setState(state => ({
          ...state,
          productSetId: undefined,
          productSet: undefined,
        }));
    },
    [setState],
  );

  const autocompleteValue = useCallback(
    (item: Product) => `${item.sku}: ${item.name}`,
    [],
  );

  return (
    <div>
      <AutocompleteObject
        data={productList}
        value={state.productSet}
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
    </div>
  );
};

export default Step_1;
