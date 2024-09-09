import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { StepperRefAttributes } from 'primereact/stepper';
import React, { FC, MutableRefObject, useMemo } from 'react';

import ProductSetItem from './ProductSetItem';
import { useFormState } from './types';

export type Props = {
  stepperRef: MutableRefObject<StepperRefAttributes | null>;
};

const Step_1: FC<Props> = props => {
  const { stepperRef } = props;
  const { state, newBathes } = useFormState();

  return (
    <>
      <Divider />
      <div className="flex flex-column ">
        {state.productSet?.setItems.map(setItem => (
          <ProductSetItem key={setItem.productId} setItem={setItem} />
        ))}
      </div>
      <div className="flex pt-4 justify-content-between">
        <Button
          label="Back"
          severity="secondary"
          icon="pi pi-arrow-left"
          onClick={() => stepperRef.current?.prevCallback()}
        />
        <Button
          label="Next"
          icon="pi pi-arrow-right"
          iconPos="right"
          disabled={!newBathes.length}
          onClick={() => stepperRef.current?.nextCallback()}
        />
      </div>
    </>
  );
};

export default Step_1;
