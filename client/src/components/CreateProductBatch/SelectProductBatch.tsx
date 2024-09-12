import NiceModal from '@ebay/nice-modal-react';
import { Flex, Stack } from '@mantine/core';
import React, { type FC, useCallback, useEffect, useMemo } from 'react';

import { useKanban } from '../../api/kanban/kanban.hook';
import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import withModal from '../withModal';

export interface Props {
  onSelect: (data: ProductBatch) => void;
  productId: number;
  excludedIds?: number[];
  initialId?: number | null;
  closeModal: () => void;
}

export const SelectProductBatch: FC<Props> = ({
  onSelect,
  productId,
  excludedIds = [],
  initialId,
  closeModal,
}) => {
  const query = useMemo(() => ({ productIds: [productId] }), [productId]);
  const { kanbanCards } = useKanban(query);

  const cards = useMemo(
    () => kanbanCards.filter(item => !excludedIds.includes(item.id)),
    [kanbanCards],
  );

  const columns = useMemo(() => {
    const map = new Map<number, { id: number; title: string; order: number }>();
    cards.forEach(item => {
      if (item.status) {
        map.set(item.status.id, item.status);
      }
    });
    return [...map.values()].toSorted((a, b) => a.order - b.order);
  }, [cards]);

  useEffect(() => {
    if (initialId && cards.length) {
      cards.forEach(item => {
        if (item.__typename == 'ProductBatchGroupDto') {
          item.productBatchList.forEach(child => {
            if (child.id == initialId) {
              onSelect(child);
              return;
            }
          });
        } else if (item.__typename == 'ProductBatchDto') {
          if (item.id == initialId) {
            onSelect(item);
            return;
          }
        }
      });
    }
  }, [initialId, cards]);

  const onSelectHandle = useCallback(
    (value: ProductBatch) => {
      onSelect(value);
      closeModal();
    },
    [onSelect, closeModal],
  );

  return (
    <div>
      <h3>Выбрать исходную партию</h3>
      <div>
        <Flex>
          {columns.map((column, index) => (
            <div key={column.id}>
              <h6>{column.title}</h6>

              <Stack>
                {cards
                  .filter(item => item.statusId == column.id)
                  .map(item =>
                    item.__typename == 'ProductBatchGroupDto' ? (
                      <div style={{ cursor: 'pointer' }} key={item.id}>
                        <div>
                          {item.productBatchList.map(item => {
                            return (
                              <div
                                style={{ cursor: 'pointer' }}
                                key={item.id}
                                onClick={() => onSelectHandle(item)}
                              >
                                {item.id}: {item.order}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{ cursor: 'pointer' }}
                        key={item.id}
                        onClick={() => onSelectHandle(item as ProductBatch)}
                      >
                        {item.id}: {item.order}
                      </div>
                    ),
                  )}
              </Stack>
            </div>
          ))}
        </Flex>
      </div>
    </div>
  );
};

export const SelectProductBatchModal = NiceModal.create(
  withModal(SelectProductBatch, {
    header: 'Выберите партию',
  }),
);
