import { useModal } from '@ebay/nice-modal-react';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import React, { FC, useCallback } from 'react';

import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { SelectProductBatchModal } from '../CreateProductBatch/SelectProductBatch';
import { useFormState } from './types';

export type Props = {};

const Step_1: FC<Props> = props => {
  const { state, updateSelectedSetSource } = useFormState();

  const productBatchModal = useModal(SelectProductBatchModal);
  const showProductBatchModal = useCallback(() => {
    if (state.productId)
      productBatchModal.show({
        productId: state.productId,
        excludedIds: state.sources?.map(({ id }) => id),
        onSelect: (batch: ProductBatch) => {
          updateSelectedSetSource(batch.id, {
            ...batch,
            selectedCount: null,
          });
        },
      });
  }, []);

  return (
    <>
      <Button onClick={showProductBatchModal} size="small" type="button">
        Выбрать партии
      </Button>
      <div>
        {state.sources?.map(item => {
          return (
            <div key={item.id}>
              <div>
                партия <strong>#{item.id}</strong>, кол-во: {item.count}
              </div>
              <div style={{ display: 'flex' }}>
                <label>Количество</label>
                <InputNumber
                  required
                  placeholder=" шт"
                  suffix=" шт"
                  maxFractionDigits={0}
                  value={item.selectedCount}
                  onValueChange={e =>
                    updateSelectedSetSource(item.id, {
                      ...item,
                      selectedCount: e.value ?? null,
                    })
                  }
                />

                <Button
                  icon="pi pi-arrows-alt"
                  onClick={() => updateSelectedSetSource(item.id, null)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Step_1;
