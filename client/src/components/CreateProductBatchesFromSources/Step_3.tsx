import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { StepperRefAttributes } from 'primereact/stepper';
import React, { FC, MutableRefObject } from 'react';

import { useFormState } from './types';

export type Props = {
  stepperRef: MutableRefObject<StepperRefAttributes | null>;
};

const Step_1: FC<Props> = props => {
  const { stepperRef } = props;
  const { state } = useFormState();

  return (
    <>
      <Divider />
      <div className="flex flex-column ">
        <h6>Новые партии</h6>
        <div>
          {/*{state.sources.map(item => {*/}
          {/*  return (*/}
          {/*    <div className="flex">*/}
          {/*      <div>*/}
          {/*        <div>{item.id}</div>*/}
          {/*        <div>{item.count}</div>*/}
          {/*        <div>{item.count - item.selectedCount!}</div>*/}
          {/*      </div>*/}
          {/*      <div>*/}
          {/*        <div>{item.selectedCount}</div>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  );*/}
          {/*})}*/}
        </div>
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
          type="submit"
          // disabled={!newBathes.length}
        />
      </div>
    </>
  );
};

export default Step_1;
