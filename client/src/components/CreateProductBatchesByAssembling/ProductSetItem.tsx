import { useModal } from '@ebay/nice-modal-react';
import classNames from 'classnames';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import React, { FC, useCallback, useMemo } from 'react';

import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { SetItemFragment } from '../../gql-types/graphql';
import { SelectProductBatchModal } from '../CreateProductBatch/SelectProductBatch';
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
        updateSelectedSetSource(batch.id, { ...batch, selectedCount: null });
      },
    });
  }, []);

  return (
    <div
      className={classNames(styles.container, 'flex')}
      key={setItem.productId}
    >
      <div className={classNames(styles.left, 'col-4')}>
        <div className={classNames(styles.sku, 'p-1')}>{setItem.sku}</div>
        <div className="p-2">
          <div className="mb-2">{setItem.name}</div>

          <Button
            onClick={() => showProductBatchModal(setItem.productId)}
            size="small"
            type="button"
          >
            Выбрать партии
          </Button>
        </div>
      </div>
      <div className={classNames(styles.right, 'col-8')}>
        <div className={styles.header}>
          <div>
            <strong>x{setItem.qty}</strong> :{' '}
            {state.fullCount ? setItem.qty * state.fullCount : '0'}
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
    </div>
  );
};

export default ProductSetItem;
