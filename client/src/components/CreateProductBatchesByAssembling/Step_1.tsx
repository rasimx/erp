import { InputNumber } from 'primereact/inputnumber';
import React, { FC, useCallback } from 'react';

import { Product } from '../../api/product/product.gql';
import ProductSelect from '../Autocomplete/ProductSelect';
import { useFormState } from './types';

export type Props = {};

const Step_1: FC<Props> = props => {
  const { state, setState } = useFormState();

  const changeProduct = useCallback(
    (productSet: Product | null) => {
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

  return (
    <div>
      <ProductSelect
        value={state.productSet ?? null}
        onChange={changeProduct}
        initialId={state.productSetId}
        onlySets
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
    </div>
  );
};

export default Step_1;
