import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { Active } from '@dnd-kit/core/dist/store';
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { Box, Stack } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import AddOperation from '@/components/AddOperation/AddOperation';
import AddProductBatch from '@/components/AddProductBatch/AddProductBatch';
import { ProductBatchFragment, Status } from '@/gql-types/graphql';

import { useProductBatch } from '../../api/product-batch/product-batch.hook';
import { useStatus } from '../../api/status/status.hooks';
import KanbanCard, { getCardId } from './KanbanCard';
import KanbanColumn from './KanbanColumn';
import { DraggableType } from './types';

const KanbanBoard = () => {
  const { statusList, moveStatus, loadingId: statusInLoadingId } = useStatus();

  const columnsId = useMemo(
    () => statusList.map(col => `column_${col.id}`),
    [statusList],
  );

  const {
    productBatchList,
    moveProductBatch,
    loadingId: productBatchInLoadingId,
  } = useProductBatch();
  const [cards, setCards] = useState<ProductBatchFragment[]>([]);

  useEffect(() => {
    setCards(productBatchList.map(item => ({ ...item })));
  }, [productBatchList]);

  const [activeColumn, setActiveColumn] = useState<Status | null>(null);
  const [activeCard, setActiveCard] = useState<ProductBatchFragment | null>(
    null,
  );
  const [active, setActive] = useState<Active | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  const [order, setOrder] = useState<number | null>(null);

  const onDragStart = useCallback((event: DragStartEvent) => {
    setActive(event.active);
    if (event.active.data.current?.type === DraggableType.Column) {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === DraggableType.Card) {
      setActiveCard(event.active.data.current.card);
      return;
    }
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActive(null);
      setActiveColumn(null);
      setActiveCard(null);

      const { active, over } = event;
      if (!over) return;

      const activeId = active.id;
      const overId = over.id;

      const isActiveCard = active.data.current?.type === DraggableType.Card;
      if (isActiveCard) {
        const activeBatch = cards.find(
          item => item.id == active.data.current?.card.id,
        );
        if (!activeBatch) {
          // todo: обработать
          throw new Error('AAA');
        }
        const currentIndex = cards.indexOf(activeBatch);
        const originalBatch = productBatchList.find(
          item => item.id == active.data.current?.card.id,
        );
        if (!originalBatch) {
          // todo: обработать
          throw new Error('AAA');
        }
        const originalIndex = productBatchList.indexOf(originalBatch);

        if (
          currentIndex != originalIndex ||
          activeBatch.statusId != originalBatch.statusId
        ) {
          const afterItems = cards.some(
            (item, index) =>
              index > currentIndex && item.statusId == activeBatch.statusId,
          );

          moveProductBatch({
            id: activeBatch.id,
            statusId: activeBatch.statusId,
            order: afterItems ? order : undefined,
          });
        }
      }

      if (activeId === overId) return;

      const isActiveColumn = active.data.current?.type === DraggableType.Column;
      if (isActiveColumn) {
        if (!active.data.current || !over.data.current)
          throw new Error('currrent was not defined');
        moveStatus(active.data.current.column, over.data.current.column);
      }
    },
    [cards, moveStatus, moveProductBatch],
  );

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      requestAnimationFrame(() => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveCard = active.data.current?.type === DraggableType.Card;
        const isOverCard = over.data.current?.type === DraggableType.Card;
        if (!isActiveCard) return;

        const activeStatus = statusList.find(
          item => item.id == active.data.current?.card.statusId,
        );

        if (isActiveCard && isOverCard) {
          const overStatus = statusList.find(
            item => item.id == over.data.current?.card.statusId,
          );

          if (
            (activeStatus?.type != 'custom' || overStatus?.type != 'custom') &&
            activeStatus?.id != overStatus?.id
          )
            // если перемещение в предалах store
            return;

          setCards(cards => {
            const activeIndex = cards.findIndex(
              t => t.id === active.data.current?.card.id,
            );
            const overIndex = cards.findIndex(
              t => t.id === over.data.current?.card.id,
            );
            const activeCard = cards[activeIndex];
            const overCard = cards[overIndex];
            setOrder(overCard.order);

            if (activeCard.statusId != overCard.statusId) {
              activeCard.statusId = overCard.statusId;
              return arrayMove(cards, activeIndex, Math.max(overIndex - 1, 0));
            }

            return arrayMove(cards, activeIndex, overIndex);
          });
        }

        const isOverAColumn = over.data.current?.type === DraggableType.Column;

        // Im dropping a Task over a column
        if (isActiveCard && isOverAColumn) {
          if (
            activeStatus?.type != 'custom' ||
            over.data.current?.column.type != 'custom'
          )
            // если перемещение в предалах store
            return;

          setCards(cards => {
            const activeIndex = cards.findIndex(
              t => t.id === active.data.current?.card.id,
            );

            if (!over.data.current?.column.id)
              throw new Error('over.data.current?.colum.id was not defined');
            cards[activeIndex].statusId = over.data.current?.column.id;
            return arrayMove(cards, activeIndex, activeIndex);
          });
          setOrder(null);
        }
      });
    },
    [statusList],
  );

  const activeColumnCards = useMemo(
    () =>
      (activeColumn &&
        cards.filter(batch => batch.statusId == activeColumn.id)) ??
      [],
    [activeColumn],
  );

  const modifiers = useMemo(() => {
    const modifiers = [];
    if (active && active.data.current?.modifiers?.length)
      modifiers.push(...active.data.current?.modifiers);
    return modifiers;
  }, [active]);

  return (
    <Box
      sx={{ p: 2, height: '90vh', display: 'flex', flexDirection: 'column' }}
    >
      <Box>
        <AddOperation />
        <AddProductBatch />
      </Box>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        modifiers={modifiers}
      >
        <Stack
          direction="row"
          spacing={2}
          alignContent="stretch"
          sx={{ flexGrow: 1, maxHeight: '100%' }}
        >
          <SortableContext items={columnsId}>
            {statusList?.map(status => {
              const children = cards.filter(
                batch => batch.statusId == status.id,
              );
              return (
                <KanbanColumn
                  key={status.id}
                  column={status}
                  loading={status.id === statusInLoadingId}
                  items={children.map(item => getCardId(item))}
                >
                  {children.map(batch => (
                    <KanbanCard
                      card={batch}
                      key={batch.id}
                      modifiers={
                        status.type != 'custom'
                          ? [restrictToFirstScrollableAncestor]
                          : []
                      }
                      loading={batch.id == productBatchInLoadingId}
                    />
                  ))}
                </KanbanColumn>
              );
            })}
          </SortableContext>
        </Stack>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <KanbanColumn
                column={activeColumn}
                items={activeColumnCards.map(item => getCardId(item))}
              >
                {activeColumnCards.map(batch => (
                  <KanbanCard card={batch} key={batch.id} />
                ))}
              </KanbanColumn>
            )}
            {activeCard && <KanbanCard card={activeCard} />}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </Box>
  );
};

export default KanbanBoard;
