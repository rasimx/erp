import { Button } from 'primereact/button';
import { Stepper, StepperRefAttributes } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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
  const [active, setActive] = useState(0);
  const nextStep = useCallback(() => {
    setActive(current => (current < 2 ? current + 1 : current));
    stepperRef.current?.nextCallback();
  }, []);
  const prevStep = useCallback(() => {
    setActive(current => (current > 0 ? current - 1 : current));
    stepperRef.current?.prevCallback();
  }, []);

  const nextStepDisabled = useMemo(() => {
    switch (active) {
      case 1:
        return !state.productSet || !state.fullCount;
      case 2:
        return false;
      default:
        return false;
    }
  }, [active, state]);

  return (
    <FormContext.Provider value={{ state, setState }}>
      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <Stepper ref={stepperRef}>
          <StepperPanel header="Header I">
            <Step_1 />
          </StepperPanel>
          <StepperPanel header="Header II">
            <Step_2 />
          </StepperPanel>
          <StepperPanel header="Header III">
            <Step_3 />
          </StepperPanel>
        </Stepper>

        <div>
          <Button onClick={prevStep}>Back</Button>
          <Button onClick={nextStep} disabled={nextStepDisabled}>
            Next step
          </Button>
        </div>
      </form>
    </FormContext.Provider>
  );
};

export default CreateProductBatchesByAssemblingForm;
