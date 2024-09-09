import { Stepper, StepperRefAttributes } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import React, { FC, useEffect, useRef, useState } from 'react';

import Step_1 from './Step_1';
import Step_2 from './Step_2';
import Step_3 from './Step_3';
import { FormContext, FormProps, FormState, Props } from './types';

const CreateProductBatchesByAssemblingForm: FC<Props & FormProps> = props => {
  const { handleSubmit, setValues } = props;

  const [state, setState] = useState<FormState>({});

  useEffect(() => {
    setValues(values => ({
      ...values,
      fullCount: state.fullCount,
      productSetId: state.productSetId,
      sources: state.sources?.map(item => ({
        selectedCount: item.selectedCount,
        id: item.id,
      })),
    }));
  }, [state]);

  const stepperRef = useRef<StepperRefAttributes>(null);

  return (
    <FormContext.Provider value={{ state, setState }}>
      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <Stepper ref={stepperRef} linear>
          <StepperPanel header="Выбор товара">
            <Step_1 stepperRef={stepperRef} />
          </StepperPanel>

          <StepperPanel header="Фасовка">
            <Step_2 stepperRef={stepperRef} />
          </StepperPanel>
          <StepperPanel header="Фасовка 2">
            <Step_3 stepperRef={stepperRef} />
          </StepperPanel>
        </Stepper>
      </form>
    </FormContext.Provider>
  );
};

export default CreateProductBatchesByAssemblingForm;
