import { Button } from 'primereact/button';
import { StepperRefAttributes } from 'primereact/stepper';
import { Steps } from 'primereact/steps';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import classes from './form.module.scss';
import Step_1 from './Step_1';
import Step_2 from './Step_2';
import Step_3 from './Step_3';
import { FormContext, FormProps, FormState, Props } from './types';

const CreateProductBatchesByAssemblingForm: FC<Props & FormProps> = props => {
  const { handleSubmit, setValues, submitForm } = props;

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
  const [activeStep, setActiveStep] = useState(0);
  const nextStep = useCallback(() => {
    setActiveStep(current => (current < 2 ? current + 1 : current));
    stepperRef.current?.nextCallback();
  }, []);
  const prevStep = useCallback(() => {
    setActiveStep(current => (current > 0 ? current - 1 : current));
    stepperRef.current?.prevCallback();
  }, []);

  const nextStepDisabled = useMemo(() => {
    switch (activeStep) {
      case 1:
        return !state.productSet || !state.fullCount;
      case 2:
        return false;
      default:
        return false;
    }
  }, [activeStep, state]);

  const items = useMemo(
    () => [
      {
        label: 'Выбор товара',
      },
      {
        label: 'Выбор партий',
        disabled: !state.productSet || !state.fullCount,
      },
      {
        label: 'Предпросмотр',
        disabled:
          state.fullCount == null ||
          state.fullCount == 0 ||
          state.fullCount !=
            state.sources?.reduce(
              (prev, cur) => prev + (cur.selectedCount || 0),
              0,
            ),
      },
    ],
    [state],
  );

  return (
    <FormContext.Provider value={{ state, setState }}>
      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <Steps
          model={items}
          activeIndex={activeStep}
          onSelect={e => setActiveStep(e.index)}
          readOnly={false}
        />
        <div>
          {activeStep == 0 && <Step_1 />}
          {activeStep == 1 && <Step_2 />}
          {activeStep == 2 && <Step_3 />}
        </div>

        <div className={classes.bottom}>
          {activeStep === 2 ? (
            <Button
              disabled={nextStepDisabled}
              type="button"
              onClick={submitForm}
            >
              Отправить
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={nextStepDisabled}
              type="button"
            >
              Next step
            </Button>
          )}
        </div>
      </form>
    </FormContext.Provider>
  );
};

export default CreateProductBatchesByAssemblingForm;
