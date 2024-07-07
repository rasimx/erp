import {
  closestCenter,
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MeasuringConfiguration,
  MeasuringStrategy,
  Over,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { Active } from '@dnd-kit/core/dist/store';
import { DataRef } from '@dnd-kit/core/dist/store/types';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { Box, Divider, Stack } from '@mui/material';
import { indexOf } from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import isNumber from 'lodash/isNumber';
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import AddOperation from '@/components/AddOperation/AddOperation';

import KanbanCard from './KanbanCard';
import KanbanColumn from './KanbanColumn';
import KanbanGroup, {
  getGroupId,
  isInGroup,
  isInsteadGroup,
} from './KanbanGroup';
import {
  DraggableType,
  IsForbiddenFunc,
  ModifiersFunc,
  SortableItem,
  SortableType,
} from './types';

const measuring: MeasuringConfiguration = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

type CardFunction<Card> = (card: Card) => number | null;
type GroupFunction<Group> = (group: Group) => number;

export type Props<
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
> = {
  columnItems: Column[];
  moveColumn: (active: Column, over: Column) => void;
  getColumnTitle: (column: Column) => string;
  isGroup: (item: Group | Card) => boolean;
  isInGroup: (item: Card) => boolean;
  getGroupTitle: (group: Group) => string;
  getGroupItems: (group: Group) => Card[];
  setGroupItems: (group: Group, items: Card[]) => Group;
  moveGroup: (data: { id: number; columnId: number; order?: number }) => void;
  moveCard: (data: { id: number; columnId: number; order?: number }) => void;
  cardItems: (Group | Card)[];
  getColumnId: CardFunction<Card> | GroupFunction<Group>;
  getGroupId: (card: Card) => number | null;
  setColumnId: (card: Group | Card, newColumnId: number | null) => void;
  setGroupId: (card: Card, newGroupId: number | null) => void;
  renderCard: (data: Card) => ReactElement;
  isForbiddenMove?: IsForbiddenFunc<Column, Group, Card>;
  modifiers?: ModifiersFunc<Column, Group, Card>;
};

const existsIndex = (index: number | null | undefined): index is number =>
  index !== null && index !== undefined && index >= 0;

const KanbanBoard = <
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
>({
  columnItems,
  moveColumn,
  getColumnTitle,
  getColumnId,
  getGroupId,
  setGroupId,
  getGroupTitle,
  isGroup,
  isInGroup,
  getGroupItems,
  setGroupItems,
  setColumnId,
  cardItems,
  moveCard,
  moveGroup,
  renderCard,
  isForbiddenMove,
  modifiers,
}: Props<Column, Group, Card>) => {
  const [columns, setColumns] = useState<Column[]>(columnItems);
  useEffect(() => {
    setColumns(columnItems);
  }, [columnItems]);

  const columnsId = useMemo(
    () => columns.map(col => `column_${col.id}`),
    [columns],
  );

  const [cards, setCards] = useState<(Group | Card)[]>(cardItems);

  useEffect(() => {
    setCards(cloneDeep(cardItems));
  }, [cardItems]);

  const [active, setActive] = useState<Active | null>(null);
  const [over, setOver] = useState<Over | null>(null);
  const activeCard = useMemo<Card | null>(
    () =>
      active?.data.current?.type === DraggableType.Card
        ? active.data.current.data
        : null,
    [active],
  );
  const activeGroup = useMemo<Group | null>(
    () =>
      active?.data.current?.type === DraggableType.Group
        ? active.data.current.data
        : null,
    [active],
  );
  const activeColumn = useMemo<Column | null>(
    () =>
      active?.data.current?.type === DraggableType.Column
        ? active.data.current.data
        : null,
    [active],
  );

  const overCard = useMemo<Card | null>(
    () =>
      over?.data.current?.type === DraggableType.Card
        ? over.data.current.data
        : undefined,
    [over],
  );
  const overGroup = useMemo<Group | null>(
    () =>
      over?.data.current?.type === DraggableType.Column
        ? over.data.current.data
        : undefined,
    [over],
  );
  const overColumn = useMemo<Column | null>(
    () =>
      over?.data.current?.type === DraggableType.Column
        ? over.data.current.data
        : undefined,
    [over],
  );

  const onDragStart = useCallback((event: DragStartEvent) => {
    setActive(event.active);
  }, []);

  const onDragOver = useCallback((event: DragOverEvent) => {
    requestAnimationFrame(() => {
      setOver(event.over);
    });
  }, []);
  console.log(cards);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActive(null);
      setOver(null);

      const { active, over } = event;
      if (!over) return;

      if (active.id === over.id) return;

      const activeDataRef = active.data as SortableItem<Column, Group, Card>;
      const overDataRef = over.data as SortableItem<Column, Group, Card>;
      const activeData = activeDataRef.current;
      const overData = overDataRef.current;
      if (!activeData || !overData) return;

      if (
        isForbiddenMove &&
        isForbiddenMove({
          active: activeData,
          over: overData,
        })
      )
        return;

      switch (activeData.type) {
        case DraggableType.Card: {
          const activeCard = activeData.data;
          switch (overData.type) {
            case DraggableType.Card: {
              const overCard = overData.data;

              if (activeCard == overCard) return;

              const activeGroupId = getGroupId(activeCard);
              const activeGroup = activeGroupId
                ? (cards.find(
                    item => isGroup(item) && item.id === activeGroupId,
                  ) as Group)
                : null;
              const activeIndexInGroup =
                activeGroup && getGroupItems(activeGroup).indexOf(activeCard);

              const overGroupId = getGroupId(overCard);
              const overGroup = overGroupId
                ? (cards.find(
                    item => isGroup(item) && item.id === overGroupId,
                  ) as Group)
                : null;
              const overIndexInGroup =
                overGroup && getGroupItems(overGroup).indexOf(overCard);

              const activeColumnId = (getColumnId as CardFunction<Card>)(
                activeCard,
              );
              const activeColumn =
                activeColumnId !== undefined
                  ? columns.find(item => activeColumnId == item.id)
                  : null;
              const activeIndex = activeColumnId && cards.indexOf(activeCard);
              const overColumnId = (getColumnId as CardFunction<Card>)(
                overCard,
              );
              const overColumn =
                overColumnId !== undefined
                  ? columns.find(item => overColumnId == item.id)
                  : null;
              const overIndex = overColumnId && cards.indexOf(overCard);

              if (activeColumn && activeColumn.id == overColumn?.id) {
                // если over - следующий за active - return
                const nextIndexOfActiveInColumn =
                  existsIndex(activeIndex) &&
                  cards.findIndex(
                    (card, index) =>
                      getColumnId(card) == overColumnId && index > activeIndex,
                  );
                if (
                  existsIndex(overIndex) &&
                  overIndex == nextIndexOfActiveInColumn
                ) {
                  return;
                }
              }

              if (activeGroup && activeGroup.id == overGroup?.id) {
                // если over - следующий за active - return
                const nextIndexOfActiveInGroup =
                  existsIndex(activeIndexInGroup) &&
                  getGroupItems(overGroup).findIndex(
                    (card, index) => index > activeIndexInGroup,
                  );
                if (
                  existsIndex(overIndexInGroup) &&
                  overIndexInGroup == nextIndexOfActiveInGroup
                ) {
                  return;
                }
                if (
                  !(
                    existsIndex(activeIndexInGroup) &&
                    existsIndex(overIndexInGroup)
                  )
                )
                  throw new Error('activeIndexInGroup or overIndexInGroup');
                setGroupItems(
                  activeGroup,
                  arrayMove(
                    getGroupItems(activeGroup),
                    activeIndexInGroup,
                    activeIndexInGroup > overIndexInGroup
                      ? overIndexInGroup
                      : overIndexInGroup - 1,
                  ),
                );
              } else {
                if (activeGroup && existsIndex(activeIndexInGroup)) {
                  setGroupId(activeCard, null);
                  setGroupItems(
                    activeGroup,
                    getGroupItems(activeGroup).toSpliced(activeIndexInGroup, 1),
                  );
                }
                if (overGroup && existsIndex(overIndexInGroup)) {
                  setGroupId(activeCard, overGroup.id);
                  setGroupItems(
                    overGroup,
                    getGroupItems(overGroup).toSpliced(
                      overIndexInGroup,
                      0,
                      activeCard,
                    ),
                  );
                }
              }

              if (existsIndex(activeIndex) && existsIndex(overIndex)) {
                setColumnId(cards[activeIndex], overColumnId);
                setCards(
                  arrayMove(
                    cards,
                    activeIndex,
                    activeIndex > overIndex ? overIndex : overIndex - 1,
                  ),
                );
              } else {
                if (existsIndex(activeIndex)) {
                  setColumnId(cards[activeIndex], null);
                  cards.splice(activeIndex, 1);
                } else if (existsIndex(overIndex)) {
                  setColumnId(activeCard, overColumnId);
                  cards.splice(overIndex, 0, activeCard);
                }
                setCards(cards);
              }

              // let order = overCard.order;
              // if (
              //   getColumnId(activeCardData) === overColumnId &&
              //   overIndex > activeIndex
              // ) {
              //   // если перемещается в конец в текущем столбце
              //   const prevIndexOfOverInColumn = cards.findLast(
              //     (card, index) =>
              //       getColumnId(card) == overColumnId && index < overIndex,
              //   );
              //   order = prevIndexOfOverInColumn?.order;
              // }
              // moveCard({
              //   id: activeCard.id,
              //   columnId: overColumnId,
              //   order,
              // });

              break;
            }
            case DraggableType.Group: {
              const overGroup = overData.data;

              const activeGroupId = getGroupId(activeCard);
              const activeGroup = activeGroupId
                ? (cards.find(
                    item => isGroup(item) && item.id === activeGroupId,
                  ) as Group)
                : null;
              const activeIndexInGroup =
                activeGroup && getGroupItems(activeGroup).indexOf(activeCard);

              const activeColumnId = (getColumnId as CardFunction<Card>)(
                activeCard,
              );
              const activeColumn =
                activeColumnId !== undefined
                  ? columns.find(item => activeColumnId == item.id)
                  : null;
              const activeIndex = activeColumnId && cards.indexOf(activeCard);

              const overColumnId = (getColumnId as GroupFunction<Group>)(
                overGroup,
              );
              const overColumn =
                overColumnId !== undefined
                  ? columns.find(item => overColumnId == item.id)
                  : null;
              const overIndex = overColumnId && cards.indexOf(overGroup);

              if (activeColumn && activeColumn.id == overColumn?.id) {
                // если over - следующий за active - return
                const nextIndexOfActiveInColumn =
                  existsIndex(activeIndex) &&
                  cards.findIndex(
                    (card, index) =>
                      getColumnId(card) == overColumnId && index > activeIndex,
                  );
                if (
                  existsIndex(overIndex) &&
                  overIndex == nextIndexOfActiveInColumn
                ) {
                  return;
                }
              }

              if (activeGroup && existsIndex(activeIndexInGroup)) {
                setGroupId(activeCard, null);
                setGroupItems(
                  activeGroup,
                  getGroupItems(activeGroup).toSpliced(activeIndexInGroup, 1),
                );
              }

              const isInstead = isInsteadGroup(active, over);

              if (overGroup && !isInstead) {
                setGroupId(activeCard, overGroup.id);
                setGroupItems(overGroup, [
                  ...getGroupItems(overGroup),
                  activeCard,
                ]);
              }

              if (
                isInstead &&
                existsIndex(activeIndex) &&
                existsIndex(overIndex)
              ) {
                setColumnId(activeCard, overColumnId);
                if (activeIndex > overIndex) {
                  setCards(arrayMove(cards, activeIndex, overIndex));
                } else {
                  setCards(arrayMove(cards, activeIndex, overIndex - 1));
                }
              } else {
                if (existsIndex(activeIndex)) {
                  setColumnId(activeCard, null);
                  cards.splice(activeIndex, 1);
                } else if (isInstead && existsIndex(overIndex)) {
                  setColumnId(activeCard, overColumnId);
                  cards.splice(overIndex, 0, activeCard);
                }
                setCards(cards);
              }

              break;
            }
            case DraggableType.Column: {
              const overColumn = overData.data;

              const activeGroupId = getGroupId(activeCard);
              const activeGroup = activeGroupId
                ? (cards.find(
                    item => isGroup(item) && item.id === activeGroupId,
                  ) as Group)
                : null;
              const activeIndexInGroup =
                activeGroup && getGroupItems(activeGroup).indexOf(activeCard);

              const activeColumnId = (getColumnId as CardFunction<Card>)(
                activeCard,
              );
              const activeColumn =
                activeColumnId !== undefined
                  ? columns.find(item => activeColumnId == item.id)
                  : null;
              const activeIndex = activeColumnId && cards.indexOf(activeCard);

              const lastIndexOnColumn = cards.findLastIndex(
                card => getColumnId(card) == overColumn.id,
              );
              if (activeIndex == lastIndexOnColumn) return; // уже последний в этой колонке

              if (activeGroup && existsIndex(activeIndexInGroup)) {
                setGroupId(activeCard, null);
                setGroupItems(
                  activeGroup,
                  getGroupItems(activeGroup).toSpliced(activeIndexInGroup, 1),
                );
              }

              setColumnId(activeCard, overColumn.id);
              if (activeIndex) {
                setCards(arrayMove(cards, activeIndex, lastIndexOnColumn + 1));
              } else {
                setCards([...cards, activeCard]);
              }

              // moveCard({
              //   id,
              //   columnId: overColumnId,
              // });
              break;
            }
          }
          break;
        }
        case DraggableType.Group: {
          const activeGroup = activeData.data;
          switch (overData.type) {
            case DraggableType.Card: {
              const overCard = overData.data;
              break;
            }
            case DraggableType.Group: {
              const overGroup = overData.data;
              break;
            }
            case DraggableType.Column: {
              const overColumn = overData.data;
              break;
            }
          }
          break;
        }
        case DraggableType.Column: {
          const activeColumn = activeData.data;
          const overColumn = overData.data as Column;

          setColumns(items => {
            const activeIndex = items.indexOf(activeColumn);
            const overIndex = items.indexOf(overColumn);
            return arrayMove(items, activeIndex, overIndex);
          });

          moveColumn(activeColumn, overColumn);
          break;
        }
      }

      /*if (activeDataRef.current.type === DraggableType.Card) {
        const activeCard = activeDataRef.current.data;

        const activeIndex = cards.findIndex(item => item.id == activeCard.id);

        const id = activeCard.id;

        switch (overDataRef.current.type) {
          case DraggableType.Card: {
            const overCard = overDataRef.current.data;
            if (isInGroup(overCard)) {
              const overGroupId = getGroupId(overCard);
            } else {
              const overColumnId = getColumnId(overCard);
              const overIndex = cards.findIndex(item => item.id == overCard.id);
              const nextIndexOfActiveInColumn = cards.findIndex(
                (card, index) =>
                  getColumnId(card) == overColumnId && index > activeIndex,
              );
              if (
                overIndex == activeIndex ||
                (overIndex == nextIndexOfActiveInColumn &&
                  getColumnId(activeCardData) == overColumnId)
              )
                return;

              setCards(cards => {
                setColumnId(cards[activeIndex], overColumnId);
                if (activeIndex > overIndex) {
                  return arrayMove(cards, activeIndex, overIndex);
                } else {
                  return arrayMove(cards, activeIndex, overIndex - 1);
                }
              });

              let order = overCardData.order;
              if (
                getColumnId(activeCardData) === overColumnId &&
                overIndex > activeIndex
              ) {
                // если перемещается в конец в текущем столбце
                const prevIndexOfOverInColumn = cards.findLast(
                  (card, index) =>
                    getColumnId(card) == overColumnId && index < overIndex,
                );
                order = prevIndexOfOverInColumn?.order;
              }
              moveCard({
                id,
                columnId: overColumnId,
                order,
              });
            }

            break;
          }
          case DraggableType.Group: {
            const overGroup = overDataRef.current.data;

            moveCard({
              id,
              groupId,
            });
            break;
          }
          case DraggableType.Column: {
            const overColumn = overDataRef.current.data;
            const overColumnId = getColumnId(overColumn.id);
            const lastIndexOnColumn = cards.findLastIndex(
              card => getColumnId(card) == overColumnId,
            );
            if (activeIndex == lastIndexOnColumn) return; // уже последний в этой колонке

            setCards(items => {
              setColumnId(items[activeIndex], overColumnId);
              return arrayMove(items, activeIndex, lastIndexOnColumn + 1);
            });
            moveCard({
              id,
              columnId: overColumnId,
            });
            break;
          }
          default:
            throw new Error(`Unknown type ${overData.type}`);
        }
      }

      if (activeData.type === DraggableType.Group) {
        const activeIndex = cards.findIndex(
          item => item.id == activeData.data.id,
        );
        const activeCardData = activeData.data;

        const overCard = overData.data;
        const id = activeCardData.id;
        let order: undefined | number;
        const overColumnId =
          overData.type === DraggableType.Card
            ? getColumnId(overCard)
            : overData.data.id;

        if (overData.type === DraggableType.Column) {
          const lastIndexOnColumn = cards.findLastIndex(
            card => getColumnId(card) == overColumnId,
          );
          if (activeIndex == lastIndexOnColumn) return;

          setCards(items => {
            setColumnId(items[activeIndex], overColumnId);
            return arrayMove(items, activeIndex, lastIndexOnColumn + 1);
          });
        } else {
          const overIndex = cards.findIndex(item => item.id == overCard.id);
          const nextIndexOfActiveOnColumn = cards.findIndex(
            (card, index) =>
              getColumnId(card) == overColumnId && index > activeIndex,
          );
          if (
            overIndex == activeIndex ||
            (overIndex == nextIndexOfActiveOnColumn &&
              getColumnId(activeCardData) == overColumnId)
          )
            return;

          setCards(cards => {
            setColumnId(cards[activeIndex], overColumnId);
            if (activeIndex > overIndex) {
              return arrayMove(cards, activeIndex, overIndex);
            } else {
              return arrayMove(cards, activeIndex, overIndex - 1);
            }
          });

          order = overCard.order;
          if (
            getColumnId(activeCardData) === overColumnId &&
            overIndex > activeIndex
          ) {
            // если перемещается в конец в текущем слобце
            const prevIndexOfOverOnColumn = cards.findLast(
              (card, index) =>
                getColumnId(card) == overColumnId && index < overIndex,
            );
            order = prevIndexOfOverOnColumn?.order;
          }
        }
        // moveCard({
        //   id,
        //   columnId: overColumnId,
        //   order,
        // });
      }

      if (activeData.type === DraggableType.Column) {
        setColumns(items => {
          const activeIndex = items.indexOf(activeData.data);
          const overIndex = items.indexOf(overData.data);
          return arrayMove(items, activeIndex, overIndex);
        });

        // moveColumn(activeData.data, overData.data);
      }*/
    },
    [cards, moveColumn, moveGroup, moveCard],
  );

  // const modifiers = useMemo(() => {
  //   const modifiers = [];
  //   if (active && active.data.current?.modifiers?.length)
  //     modifiers.push(...(active.data.current?.modifiers ?? []));
  //   return modifiers;
  // }, [active]);

  // console.log(cards);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  function customCollisionDetectionAlgorithm(args) {
    // First, let's see if there are any collisions with the pointer
    const pointerCollisions = pointerWithin(args);
    // console.log(
    //   pointerCollisions.map(
    //     item => `${item.id}_${Math.round(item.data?.value)}`,
    //   ),
    // );

    // Collision detection algorithms return an array of collisions
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // If there are no collisions with the pointer, return rectangle intersections
    return rectIntersection(args);
  }

  return (
    <Box
      sx={{ p: 2, height: '90vh', display: 'flex', flexDirection: 'column' }}
    >
      {/*<Backdrop*/}
      {/*  sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}*/}
      {/*  open={statusListLoading || productBatchListLoading}*/}
      {/*>*/}
      {/*  <CircularProgress color="inherit" />*/}
      {/*</Backdrop>*/}
      <Box>
        <AddOperation />
      </Box>

      <DndContext
        measuring={measuring}
        collisionDetection={customCollisionDetectionAlgorithm}
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        // modifiers={
        //   modifiers &&
        //   modifiers({
        //     activeCard,
        //     activeColumn,
        //     overCard,
        //     overColumn,
        //   })
        // }
      >
        <Stack
          direction="row"
          alignContent="stretch"
          sx={{ flexGrow: 1, maxHeight: '100%' }}
        >
          <SortableContext items={columnsId}>
            {columns?.map((column, index) => (
              <React.Fragment key={column.id}>
                {index != 0 && <Divider orientation="vertical" />}
                <KanbanColumn
                  column={column}
                  isForbiddenMove={isForbiddenMove}
                  getTitle={getColumnTitle}
                  getGroupTitle={getGroupTitle}
                  getGroupItems={getGroupItems}
                  isGroup={isGroup}
                  items={cards.filter(card => getColumnId(card) == column.id)}
                  // loading={column.id === statusInLoadingId}
                  renderCard={renderCard}
                />
              </React.Fragment>
            ))}
          </SortableContext>
        </Stack>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <KanbanColumn
                isActive
                column={activeColumn}
                getTitle={getColumnTitle}
                getGroupTitle={getGroupTitle}
                getGroupItems={getGroupItems}
                isGroup={isGroup}
                items={cards.filter(
                  card => getColumnId(card) == activeColumn.id,
                )}
                renderCard={renderCard}
              />
            )}
            {activeCard && <KanbanCard card={activeCard} render={renderCard} />}
            {activeGroup && (
              <KanbanGroup
                group={activeGroup}
                renderCard={renderCard}
                getGroupItems={getGroupItems}
                getGroupTitle={getGroupTitle}
              />
            )}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </Box>
  );
};

export default KanbanBoard;
