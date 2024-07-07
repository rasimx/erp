import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MeasuringConfiguration,
  MeasuringStrategy,
  Over,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { Active } from '@dnd-kit/core/dist/store';
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import {
  Backdrop,
  Box,
  Card,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';

// import AddOperation from '@/components/AddOperation/AddOperation';
import { ProductBatchFragment, Status, StatusType } from '@/gql-types/graphql';

import { useProductBatch } from '../../api/product-batch/product-batch.hook';
import { useStatus } from '../../api/status/status.hooks';
import AddProductBatchForm from '../AddProductBatch/AddProductBatchForm';
import ModalButton from '../ModalButton';
import KanbanCard, { getCardId } from './KanbanCard';
import KanbanColumn from './KanbanColumn';
import { DraggableType } from './types';

const measuring: MeasuringConfiguration = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const KanbanBoard = () => {
  const { productId } = useParams();
  const {
    statusList,
    moveStatus,
    loadingId: statusInLoadingId,
    loading: statusListLoading,
  } = useStatus();

  const columnsId = useMemo(
    () => statusList.map(col => `column_${col.id}`),
    [statusList],
  );

  const {
    productBatchList,
    moveProductBatch,
    loadingId: productBatchInLoadingId,
    loading: productBatchListLoading,
  } = useProductBatch(Number(productId));
  const [cards, setCards] = useState<ProductBatchFragment[]>([]);

  useEffect(() => {
    setCards(productBatchList.map(item => ({ ...item })));
  }, [productBatchList]);

  const [active, setActive] = useState<Active | null>(null);
  const [over, setOver] = useState<Over | null>(null);
  const activeCard = useMemo<ProductBatchFragment | null>(
    () =>
      active?.data.current?.type === DraggableType.Card
        ? active.data.current.card
        : null,
    [active],
  );
  const activeColumn = useMemo<Status | null>(
    () =>
      active?.data.current?.type === DraggableType.Column
        ? active.data.current.column
        : null,
    [active],
  );
  const overCard = useMemo<ProductBatchFragment | null>(
    () =>
      over?.data.current?.type === DraggableType.Card
        ? over.data.current.card
        : null,
    [over],
  );
  const overColumn = useMemo<Status | null>(
    () =>
      over?.data.current?.type === DraggableType.Column
        ? over.data.current.column
        : null,
    [over],
  );

  const nextIdOfActiveOnColumn = useMemo(() => {
    if (activeCard) {
      const activeIndex = cards.findIndex(item => item.id === activeCard?.id);
      return cards.find(
        (item, index) =>
          item.statusId == activeCard?.statusId && index > activeIndex,
      )?.id;
    }
  }, [activeCard, cards]);

  const activeIsLastOnColumn = useMemo<boolean>(() => {
    return (
      cards.findLast(item => item.statusId == activeCard?.statusId)?.id ==
      activeCard?.id
    );
  }, [activeCard, cards]);

  const activeColumnCards = useMemo<ProductBatchFragment[]>(
    () =>
      (activeColumn &&
        cards.filter(batch => batch.statusId == activeColumn.id)) ??
      [],
    [activeColumn, cards],
  );

  const onDragStart = useCallback((event: DragStartEvent) => {
    setActive(event.active);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActive(null);
      setOver(null);

      const { active, over } = event;
      if (!over) return;

      if (active.id === over.id) return;

      const activeData = active.data.current;
      const overData = over.data.current;
      if (!activeData || !overData) return;

      if (activeData.type === DraggableType.Card) {
        const activeIndex = cards.findIndex(
          item => item.id == activeData.card.id,
        );
        const activeBatch = activeData.card;

        const activeStatus = statusList.find(
          item => item.id == activeBatch.statusId,
        );
        const id = activeBatch.id;
        let order: undefined | number;
        const overStatusId =
          overData.type === DraggableType.Card
            ? overData.card.statusId
            : overData.column.id;

        const overStatus = statusList.find(item => item.id == overStatusId);

        if (overData.type === DraggableType.Card) {
          const overIndex = cards.findIndex(
            item => item.id == overData.card.id,
          );
          const nextIndexOfActiveOnColumn = cards.findIndex(
            (item, index) =>
              item.statusId == overStatusId && index > activeIndex,
          );
          if (
            overIndex == activeIndex ||
            (overIndex == nextIndexOfActiveOnColumn &&
              activeBatch.statusId == overStatusId)
          )
            return;

          if (
            (activeStatus?.type != StatusType.custom ||
              overStatus?.type != StatusType.custom) &&
            activeStatus?.id != overStatus?.id
          ) {
            return;
          }

          setCards(items => {
            items[activeIndex].statusId = overStatusId;
            if (activeIndex > overIndex) {
              return arrayMove(items, activeIndex, overIndex);
            } else {
              return arrayMove(items, activeIndex, overIndex - 1);
            }
          });

          order = overData.card.order;
          if (
            activeBatch.statusId === overStatusId &&
            overIndex > activeIndex
          ) {
            // если перемещается в конец в текущем слобце
            const prevIndexOfOverOnColumn = cards.findLast(
              (item, index) =>
                item.statusId == overStatusId && index < overIndex,
            );
            order = prevIndexOfOverOnColumn?.order;
          }
        } else {
          const lastIndexOnColumn = cards.findLastIndex(
            item => item.statusId == overStatusId,
          );
          if (activeIndex == lastIndexOnColumn) return;

          if (
            (activeStatus?.type != StatusType.custom ||
              overStatus?.type != StatusType.custom) &&
            activeStatus?.id != overStatus?.id
          ) {
            return;
          }
          setCards(items => {
            items[activeIndex].statusId = overStatusId;
            return arrayMove(items, activeIndex, lastIndexOnColumn + 1);
          });
        }
        moveProductBatch({
          id,
          statusId: overStatusId,
          order,
        });
      }

      if (activeData.type === DraggableType.Column) {
        moveStatus(activeData.column, overData.column);
      }
    },
    [cards, moveStatus, moveProductBatch],
  );

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      requestAnimationFrame(() => {
        const { over } = event;
        setOver(over);
      });
    },
    [statusList],
  );

  const modifiers = useMemo(() => {
    const modifiers = [];
    if (active && active.data.current?.modifiers?.length)
      modifiers.push(...(active.data.current?.modifiers ?? []));
    return modifiers;
  }, [active]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );
  return (
    <Box
      sx={{ p: 2, height: '90vh', display: 'flex', flexDirection: 'column' }}
    >
      <Backdrop
        sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}
        open={statusListLoading || productBatchListLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {/*<Box>*/}
      {/*  <AddOperation />*/}
      {/*</Box>*/}

      <DndContext
        measuring={measuring}
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        modifiers={modifiers}
      >
        <Stack
          direction="row"
          alignContent="stretch"
          sx={{ flexGrow: 1, maxHeight: '100%' }}
        >
          <SortableContext items={columnsId}>
            {statusList?.map((status, index) => {
              const children = cards.filter(
                batch => batch.statusId == status.id,
              );
              return (
                <>
                  {index != 0 && <Divider orientation="vertical" />}
                  <KanbanColumn
                    key={status.id}
                    column={status}
                    loading={status.id === statusInLoadingId}
                    items={children.map(item => getCardId(item))}
                  >
                    {children.map(batch => (
                      <Box key={batch.id}>
                        {overCard?.id == batch.id &&
                          activeCard?.id != batch.id &&
                          nextIdOfActiveOnColumn != batch.id &&
                          ((status.type != StatusType.custom &&
                            activeCard?.statusId == status.id) ||
                            status.type == StatusType.custom) && (
                            <Card
                              elevation={3}
                              sx={{
                                height: 5,
                                backgroundColor: 'rgba(0,255,0,.5)',
                                marginBottom: 1,
                              }}
                            ></Card>
                          )}
                        <KanbanCard
                          card={batch}
                          modifiers={
                            status.type != StatusType.custom
                              ? [restrictToFirstScrollableAncestor]
                              : []
                          }
                          loading={batch.id == productBatchInLoadingId}
                        />
                      </Box>
                    ))}
                    {overColumn?.id == status.id &&
                      ((!activeIsLastOnColumn &&
                        activeCard?.statusId == status.id) ||
                        activeCard?.statusId != status.id) &&
                      ((status.type != StatusType.custom &&
                        activeCard?.statusId == status.id) ||
                        status.type == StatusType.custom) && (
                        <Card
                          elevation={3}
                          sx={{
                            height: 5,
                            backgroundColor: 'rgba(0,255,0,.5)',
                          }}
                        ></Card>
                      )}
                    <ModalButton label="Добавить">
                      {handleClose => (
                        <AddProductBatchForm
                          onSubmit={handleClose}
                          statusId={status.id}
                          productId={Number(productId)}
                        />
                      )}
                    </ModalButton>
                  </KanbanColumn>
                </>
              );
            })}
          </SortableContext>
        </Stack>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <KanbanColumn
                column={activeColumn}
                isActive
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
