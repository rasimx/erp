import React, { FC } from 'react';

import ProductSetItem from './ProductSetItem';
import { useFormState } from './types';

export type Props = {};

const Step_1: FC<Props> = props => {
  const { state, newBathes } = useFormState();

  return (
    <div>
      {state.product?.setItems.map(setItem => (
        <ProductSetItem key={setItem.productId} setItem={setItem} />
      ))}
    </div>
  );
};

export default Step_1;
