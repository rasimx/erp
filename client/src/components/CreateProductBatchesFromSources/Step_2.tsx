import { useModal } from '@ebay/nice-modal-react';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Button, Flex, NumberInput } from '@mantine/core';
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
            selectedCount: undefined,
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
              <Flex>
                <NumberInput
                  required
                  label="Количество"
                  placeholder="шт"
                  allowNegative={false}
                  suffix=" шт"
                  decimalScale={0}
                  value={item.selectedCount}
                  onChange={value =>
                    updateSelectedSetSource(item.id, {
                      ...item,
                      selectedCount: value ? Number(value) : undefined,
                    })
                  }
                  hideControls
                />

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
    </>
  );
};

export default Step_1;
