import { useModal } from '@ebay/nice-modal-react';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import React, { FC, useCallback, useMemo } from 'react';

import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { SetItemFragment } from '../../gql-types/graphql';
import { SelectProductBatchModal } from '../SelectProductBatch/SelectProductBatch';
import styles from './ProductSetItem.module.scss';
import { useFormState } from './types';

export type Props = {
  setItem: SetItemFragment;
};

const ProductSetItem: FC<Props> = props => {
  const { setItem } = props;

  const { state, updateSelectedSetSource } = useFormState();

  const productBathes = useMemo(
    () =>
      state.sources?.filter(item => item.productId == setItem.productId) ?? [],
    [state, setItem],
  );

  const productBatchModal = useModal(SelectProductBatchModal);
  const showProductBatchModal = useCallback((productId: number) => {
    productBatchModal.show({
      productId,
      excludedIds: productBathes.map(({ id }) => id),
      onSelect: (batch: ProductBatch) => {
        updateSelectedSetSource(batch.id, {
          ...batch,
          selectedCount: undefined,
        });
      },
    });
  }, []);

  return (
    <div className={styles.container} key={setItem.productId}>
      <div className={styles.left}>
        <div className={styles.sku}>{setItem.sku}</div>
        <div>
          <div>{setItem.name}</div>

          <Button
            onClick={() => showProductBatchModal(setItem.productId)}
            size="small"
          >
            Выбрать партии
          </Button>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.header}>
          <div>
            <strong>x{setItem.qty}</strong> :{' '}
            {state.count ? setItem.qty * state.count : '0'}
          </div>
          <div>
            {productBathes.reduce(
              (prev, cur) => prev + (cur.selectedCount ?? 0),
              0,
            )}
          </div>
        </div>

        {productBathes.map(item => {
          return (
            <div key={item.id}>
              <div>
                партия <strong>#{item.id}</strong>, кол-во: {item.count}
              </div>
              <div style={{ display: 'flex' }}>
                <div>
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
                </div>

                <Button
                  icon="pi pi-arrows-alt"
                  onClick={() => updateSelectedSetSource(item.id, null)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductSetItem;
