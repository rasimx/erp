import { useModal } from '@ebay/nice-modal-react';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Button, Flex, NumberInput } from '@mantine/core';
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
            type="button"
          >
            Выбрать партии
          </Button>
        </div>
      </div>
      <div className={styles.right}>
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
            <div key={item.id}>
              <div>
                партия <strong>#{item.id}</strong>, кол-во: {item.count}
              </div>
              <Flex>
                <div>
                  <NumberInput
                    required
                    label="Количество"
                    placeholder="шт"
                    allowNegative={false}
                    suffix=" шт"
                    decimalScale={0}
                    value={item.selectedCount}
                    min={0}
                    max={item.count}
                    onChange={value =>
                      updateSelectedSetSource(item.id, {
                        ...item,
                        selectedCount: value ? Number(value) : undefined,
                      })
                    }
                    hideControls
                  />
                </div>

                <ActionIcon
                  variant="light"
                  onClick={() => updateSelectedSetSource(item.id, undefined)}
                >
                  <FontAwesomeIcon icon={faEllipsisV} />
                </ActionIcon>
              </Flex>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductSetItem;
