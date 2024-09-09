import { useModal } from '@ebay/nice-modal-react';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputNumber } from 'primereact/inputnumber';
import { StepperRefAttributes } from 'primereact/stepper';
import React, { FC, MutableRefObject, useCallback } from 'react';

import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { SelectProductBatchModal } from '../CreateProductBatch/SelectProductBatch';
import { useFormState } from './types';

export type Props = {
  stepperRef: MutableRefObject<StepperRefAttributes | null>;
};

const Step_1: FC<Props> = props => {
  const { stepperRef } = props;
  const { state, updateSelectedSetSource } = useFormState();

  const productBatchModal = useModal(SelectProductBatchModal);
  const showProductBatchModal = useCallback(() => {
    if (state.productId)
      productBatchModal.show({
        productId: state.productId,
        excludedIds: state.sources?.map(({ id }) => id),
        onSelect: (batch: ProductBatch) => {
          updateSelectedSetSource(batch.id, { ...batch, selectedCount: null });
        },
      });
  }, []);

  return (
    <>
      <Divider />
      <Button onClick={showProductBatchModal} size="small" type="button">
        Выбрать партии
      </Button>
      <div className="flex flex-column ">
        {state.sources?.map(item => {
          return (
            <div key={item.id} className="mt-2">
              <div>
                партия <strong>#{item.id}</strong>, кол-во: {item.count}
              </div>
              <div className="flex align-items-center justify-content-between  mt-1">
                <div className="flex-grow-1">
                  <InputNumber
                    id={`set-item-count-${item.id}`}
                    value={item.selectedCount}
                    min={0}
                    max={item.count}
                    placeholder="Количество"
                    onValueChange={e =>
                      updateSelectedSetSource(item.id, {
                        ...item,
                        selectedCount: e.value ? Number(e.value) : null,
                      })
                    }
                    className="w-full"
                  />
                </div>
                <Button
                  icon="pi pi-times"
                  className="p-button-danger ml-1"
                  onClick={() => updateSelectedSetSource(item.id, null)}
                />
              </div>
            </div>
          );
        })}
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
          disabled={
            state.fullCount !=
            state.sources?.reduce(
              (prev, cur) => prev + (cur.selectedCount || 0),
              0,
            )
          }
          onClick={() => stepperRef.current?.nextCallback()}
        />
      </div>
    </>
  );
};

export default Step_1;
