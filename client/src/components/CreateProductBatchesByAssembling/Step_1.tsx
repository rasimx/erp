import { FloatLabel } from 'primereact/floatlabel';
import { InputNumber } from 'primereact/inputnumber';
import { Nullable } from 'primereact/ts-helpers';
import React, { FC, useCallback } from 'react';

import { Product } from '../../api/product/product.gql';
import ProductSelect from '../Autocomplete/ProductSelect';
import classes from './form.module.scss';
import { useFormState } from './types';

export type Props = {};

const Step_1: FC<Props> = props => {
  const { state, setState } = useFormState();

  const changeProduct = useCallback(
    (product: Nullable<Product>) => {
      if (product) {
        setState(state => ({
          ...state,
          product,
        }));
      } else
        setState(state => ({
          ...state,
          product: undefined,
        }));
    },
    [setState],
  );

  return (
    <div>
      <div className={classes.field}>
        <FloatLabel>
          <ProductSelect
            value={state.product ?? null}
            onChange={changeProduct}
            initialId={state.product?.id}
            onlySets
          />
          <label>Продукт</label>
        </FloatLabel>
      </div>

      <div className={classes.field}>
        <FloatLabel>
          <InputNumber
            required
            placeholder=" шт"
            suffix=" шт"
            maxFractionDigits={0}
            value={state.count}
            name="count"
            onValueChange={e =>
              setState(state => ({ ...state, count: e.value }))
            }
            className={classes.input}
          />
          <label>Количество</label>
        </FloatLabel>
      </div>
    </div>
  );
};

export default Step_1;
