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
    (productSet: Nullable<Product>) => {
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
      <div className={classes.field}>
        <FloatLabel>
          <ProductSelect
            value={state.productSet ?? null}
            onChange={changeProduct}
            initialId={state.productSetId}
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
            value={state.fullCount}
            name="count"
            onValueChange={e =>
              setState(state => ({ ...state, fullCount: e.value }))
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
