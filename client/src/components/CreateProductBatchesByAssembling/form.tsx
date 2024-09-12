import { Button, Group, Stepper } from '@mantine/core';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

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

  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive(current => (current < 2 ? current + 1 : current));
  const prevStep = () =>
    setActive(current => (current > 0 ? current - 1 : current));

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
        <Stepper active={active} onStepClick={setActive}>
          <Stepper.Step label="First step" description="Create an account">
            <Step_1 />
          </Stepper.Step>
          <Stepper.Step label="Second step" description="Verify email">
            <Step_2 />
          </Stepper.Step>
          <Stepper.Completed>
            <Step_3 />
          </Stepper.Completed>
        </Stepper>

        <Group justify="center" mt="xl">
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
          <Button onClick={nextStep} disabled={nextStepDisabled}>
            Next step
          </Button>
        </Group>
      </form>
    </FormContext.Provider>
  );
};

export default CreateProductBatchesByAssemblingForm;
