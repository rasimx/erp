import { InputNumber } from 'primereact/inputnumber';
import React, { FC, useCallback, useEffect } from 'react';

import { Product } from '../../api/product/product.gql';
import { useProductList } from '../../api/product/product.hooks';
import ProductSelect from '../Autocomplete/ProductSelect';
import { useFormState } from './types';

export type Props = {};

const Step_1: FC<Props> = props => {
  const { state, setState } = useFormState();

  const { items: productList } = useProductList();

  const changeProduct = useCallback(
    (product: Product | null) => {
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

  return (
    <>
      <ProductSelect
        value={state.product ?? null}
        onChange={changeProduct}
        initialId={state.productId}
      />
      <label>Количество</label>
      <InputNumber
        required
        placeholder=" шт"
        suffix=" шт"
        maxFractionDigits={0}
        value={state.fullCount}
        onValueChange={e =>
          setState(state => ({ ...state, fullCount: e.value }))
        }
      />
    </>
  );
};

export default Step_1;
