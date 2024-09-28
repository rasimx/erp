import NiceModal from '@ebay/nice-modal-react';
import React, { type FC, useCallback, useEffect, useMemo } from 'react';

import { useKanban } from '../../api/kanban/kanban.hook';
import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import withModal from '../withModal';
import classes from './SelectProductBatch.module.scss';

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
    <div className={classes.container}>
      {columns.map(column => (
        <div key={column.id} className={classes.column}>
          <div className={classes.header}>{column.title}</div>

          <div className={classes.inner}>
            {cards
              .filter(item => item.statusId == column.id)
              .map(item =>
                item.__typename == 'ProductBatchGroupDto' ? (
                  <div className={classes.group} key={item.id}>
                    <div className={classes.groupName}>{item.name}</div>
                    <div className={classes.groupInner}>
                      {item.productBatchList.map(item => {
                        return (
                          <div
                            className={classes.card}
                            key={item.id}
                            onClick={() => onSelectHandle(item)}
                          >
                            <span>
                              #{item.order}: {item.id}
                            </span>
                            <span>{item.count} шт</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div
                    className={classes.card}
                    key={item.id}
                    onClick={() => onSelectHandle(item as ProductBatch)}
                  >
                    <span>
                      #{item.order}: {item.id}
                    </span>
                    <span>{(item as ProductBatch).count} шт</span>
                  </div>
                ),
              )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const SelectProductBatchModal = NiceModal.create(
  withModal(SelectProductBatch, {
    header: 'Выберите партию',
  }),
);
