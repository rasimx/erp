import {
  Active,
  ClientRect,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DroppableContainer,
  MeasuringConfiguration,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Modifiers } from '@dnd-kit/core/dist/modifiers';
import { RectMap } from '@dnd-kit/core/dist/store';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
// import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { Coordinates } from '@dnd-kit/utilities';
import { over } from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import { Divider } from 'primereact/divider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import classes from './KanbanBoard.module.scss';
import KanbanCard from './KanbanCard';
import KanbanColumn from './KanbanColumn';
import KanbanGroup, { isInsteadGroup } from './KanbanGroup';
import {
  createKanbanBoardContext,
  DraggableType,
  KanbanBoardProps,
  SortableItem,
  SortableType,
} from './types';

const measuring: MeasuringConfiguration = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const existsIndex = (index: number | null | undefined): index is number =>
  index !== null && index !== undefined && index >= 0;

const KanbanBoard = <
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
>(
  props: KanbanBoardProps<Column, Group, Card>,
) => {
  const {
    columnItems,
    moveColumn,
    getColumnId,
    getGroupId,
    setGroupId,
    isGroup,
    getGroupItems,
    setGroupItems,
    setColumnId,
    cardItems,
    moveCard,
    moveGroup,
    isForbiddenMove,
  } = props;

  const KanbanBoardContext = createKanbanBoardContext<Column, Group, Card>();

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

  const onDragStart = useCallback((event: DragStartEvent) => {
    setActive(event.active);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActive(null);

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

          const activeGroupId = getGroupId(activeCard);
          const activeGroup = activeGroupId
            ? (cards.find(
                item => isGroup(item) && item.id === activeGroupId,
              ) as Group)
            : null;
          const activeIndexInGroup =
            activeGroup && getGroupItems(activeGroup).indexOf(activeCard);

          const activeColumnId = getColumnId(activeCard);
          const activeColumn = existsIndex(activeColumnId)
            ? columns.find(item => activeColumnId == item.id) ?? null
            : null;
          const activeIndex = activeColumnId && cards.indexOf(activeCard);

          switch (overData.type) {
            case DraggableType.Card: {
              const overCard = overData.data;

              if (activeCard == overCard) return;

              const overGroupId = getGroupId(overCard);
              const overGroup = overGroupId
                ? (cards.find(
                    item => isGroup(item) && item.id === overGroupId,
                  ) as Group)
                : null;
              const overIndexInGroup =
                overGroup && getGroupItems(overGroup).indexOf(overCard);

              const overColumnId = getColumnId(overCard);
              const overColumn = existsIndex(overColumnId)
                ? columns.find(item => overColumnId == item.id) ?? null
                : null;
              const overIndex = overColumn && cards.indexOf(overCard);

              let order: number | undefined = overCard.order;

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

                if (!(existsIndex(activeIndex) && existsIndex(overIndex)))
                  throw new Error('activeIndexInGroup or overIndexInGroup');
                // если перемещается в конец в текущем столбце
                if (overIndex > activeIndex) {
                  const prevIndexOfOverInColumn = cards.findLast(
                    (card, index) =>
                      getColumnId(card) == overColumnId && index < overIndex,
                  );
                  order = prevIndexOfOverInColumn?.order;
                }
              }

              if (activeGroup && activeGroup.id == overGroup?.id) {
                if (
                  !(
                    existsIndex(activeIndexInGroup) &&
                    existsIndex(overIndexInGroup)
                  )
                )
                  throw new Error('activeIndexInGroup or overIndexInGroup');
                // если over - следующий за active - return
                const nextIndexOfActiveInGroup = getGroupItems(
                  overGroup,
                ).findIndex((card, index) => index > activeIndexInGroup);
                if (overIndexInGroup == nextIndexOfActiveInGroup) {
                  return;
                }

                // если перемещается в конец в текущей группе - меняем order на предыдущего
                if (overIndexInGroup > activeIndexInGroup) {
                  const prevIndexOfOverInGroup = getGroupItems(
                    overGroup,
                  ).findLast((card, index) => index < overIndexInGroup);
                  order = prevIndexOfOverInGroup?.order;
                }

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

              moveCard({
                id: activeCard.id,
                columnId: overColumn ? overColumn.id : null,
                groupId: overGroup ? overGroup.id : null,
                order,
              });

              break;
            }
            case DraggableType.Group: {
              const overGroup = overData.data;

              const overColumnId = getColumnId(overGroup) as number;
              const overColumn = columns.find(
                item => overColumnId == item.id,
              ) as Column;
              const overIndex = cards.indexOf(overGroup);

              const isInstead = isInsteadGroup(active, over);

              let order: number | undefined;

              if (isInstead) {
                order = overGroup.order;

                if (activeColumn && activeColumn.id == overColumn.id) {
                  if (!existsIndex(activeIndex))
                    throw new Error('activeIndex is undefined');
                  // если over - следующий за active - return
                  const nextIndexOfActiveInColumn = cards.findIndex(
                    (card, index) =>
                      getColumnId(card) == overColumnId && index > activeIndex,
                  );
                  if (overIndex == nextIndexOfActiveInColumn) {
                    return;
                  }

                  if (overIndex > activeIndex) {
                    const prevIndexOfOverInColumn = cards.findLast(
                      (card, index) =>
                        getColumnId(card) == overColumnId && index < overIndex,
                    );
                    order = prevIndexOfOverInColumn?.order;
                  }
                }
              }

              if (activeGroup && existsIndex(activeIndexInGroup)) {
                setGroupId(activeCard, null);
                setGroupItems(
                  activeGroup,
                  getGroupItems(activeGroup).toSpliced(activeIndexInGroup, 1),
                );
              }

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

              moveCard({
                id: activeCard.id,
                columnId: isInstead ? overColumn.id : null,
                groupId: !isInstead ? overGroup.id : null,
                order,
              });

              break;
            }
            case DraggableType.Column: {
              const overColumn = overData.data;

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
              if (existsIndex(activeIndex)) {
                setCards(arrayMove(cards, activeIndex, lastIndexOnColumn + 1));
              } else {
                setCards([...cards, activeCard]);
              }

              moveCard({
                id: activeCard.id,
                columnId: overColumn.id,
                groupId: null,
              });
              break;
            }
          }
          break;
        }
        case DraggableType.Group: {
          const activeGroup = activeData.data;
          const activeColumnId = getColumnId(activeGroup) as number;
          const activeColumn = columns.find(item => activeColumnId == item.id);
          const activeIndex = cards.indexOf(activeGroup);

          switch (overData.type) {
            case DraggableType.Card: {
              const overCard = overData.data;

              const overGroupId = getGroupId(overCard);
              if (overGroupId) return;

              const overColumnId = getColumnId(overCard);
              if (!overColumnId)
                throw new Error('overColumnId was not provided');

              const overColumn = columns.find(
                item => overColumnId == item.id,
              ) as Column;
              const overIndex = cards.indexOf(overCard);

              if (!(existsIndex(activeIndex) && existsIndex(overIndex)))
                throw new Error('activeIndex or overIndex was not provided');

              let order: number | undefined = overCard.order;
              if (activeColumn && activeColumn.id == overColumn.id) {
                // если over - следующий за active - return
                const nextIndexOfActiveInColumn = cards.findIndex(
                  (card, index) =>
                    getColumnId(card) == overColumn.id && index > activeIndex,
                );
                if (overIndex == nextIndexOfActiveInColumn) {
                  return;
                }

                if (overIndex > activeIndex) {
                  const prevIndexOfOverInColumn = cards.findLast(
                    (card, index) =>
                      getColumnId(card) == overColumnId && index < overIndex,
                  );
                  order = prevIndexOfOverInColumn?.order;
                }
              }

              setColumnId(activeGroup, overColumn.id);
              setCards(
                arrayMove(
                  cards,
                  activeIndex,
                  activeIndex > overIndex ? overIndex : overIndex - 1,
                ),
              );

              moveGroup({ id: activeGroup.id, columnId: overColumn.id, order });

              break;
            }
            case DraggableType.Group: {
              const overGroup = overData.data;

              const overColumnId = getColumnId(overGroup) as number;
              const overColumn = columns.find(
                item => overColumnId == item.id,
              ) as Column;
              const overIndex = cards.indexOf(overGroup);

              let order: number | undefined = overGroup.order;

              if (activeColumn && activeColumn.id == overColumn.id) {
                // если over - следующий за active - return
                const nextIndexOfActiveInColumn =
                  existsIndex(activeIndex) &&
                  cards.findIndex(
                    (card, index) =>
                      getColumnId(card) == overColumn.id && index > activeIndex,
                  );
                if (
                  existsIndex(overIndex) &&
                  overIndex == nextIndexOfActiveInColumn
                ) {
                  return;
                }

                if (overIndex > activeIndex) {
                  const prevIndexOfOverInColumn = cards.findLast(
                    (card, index) =>
                      getColumnId(card) == overColumnId && index < overIndex,
                  );
                  order = prevIndexOfOverInColumn?.order;
                }
              }

              const isInstead = isInsteadGroup(active, over);
              if (isInstead) {
                if (existsIndex(activeIndex) && existsIndex(overIndex)) {
                  setColumnId(activeGroup, overColumn.id);
                  if (activeIndex > overIndex) {
                    setCards(arrayMove(cards, activeIndex, overIndex));
                  } else {
                    setCards(arrayMove(cards, activeIndex, overIndex - 1));
                  }
                }

                moveGroup({
                  id: activeGroup.id,
                  columnId: overColumn.id,
                  order,
                });
              }

              break;
            }
            case DraggableType.Column: {
              const overColumn = overData.data;

              const lastIndexOnColumn = cards.findLastIndex(
                card => getColumnId(card) == overColumn.id,
              );
              if (activeIndex == lastIndexOnColumn) return; // уже последний в этой колонке

              setColumnId(activeGroup, overColumn.id);
              setCards(arrayMove(cards, activeIndex, lastIndexOnColumn + 1));
              moveGroup({ id: activeGroup.id, columnId: overColumn.id });

              break;
            }
          }
          break;
        }
        case DraggableType.Column: {
          const activeColumn = activeData.data;
          const overColumn = overData.data as Column;

          if (!overColumn) return;

          setColumns(items => {
            const activeIndex = items.indexOf(activeColumn);
            const overIndex = items.indexOf(overColumn);
            return arrayMove(items, activeIndex, overIndex);
          });
          moveColumn(activeColumn, overColumn);
          break;
        }
      }
    },
    [cards, moveColumn, moveGroup, moveCard],
  );

  const allModifiers = useMemo(() => {
    const modifiersList: Modifiers = [];
    // if (modifiers) modifiers(active?.data.current as );

    if (active && active?.data.current?.type == DraggableType.Column)
      modifiersList.push(restrictToHorizontalAxis);
    return modifiersList;
  }, [active, over]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  function customCollisionDetectionAlgorithm(args: {
    active: Active;
    collisionRect: ClientRect;
    droppableRects: RectMap;
    droppableContainers: DroppableContainer[];
    pointerCoordinates: Coordinates | null;
  }) {
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
    <KanbanBoardContext.Provider value={props}>
      <DndContext
        measuring={measuring}
        collisionDetection={customCollisionDetectionAlgorithm}
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        modifiers={allModifiers}
      >
        <div className={classes.kanban}>
          <SortableContext items={columnsId}>
            {columns?.map((column, index) => (
              <React.Fragment key={column.id}>
                {index != 0 && (
                  <Divider
                    layout="vertical"
                    type="dashed"
                    className={classes.divider}
                  />
                )}
                <KanbanColumn column={column} cards={cards} />
              </React.Fragment>
            ))}
          </SortableContext>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <KanbanColumn isActive column={activeColumn} cards={cards} />
            )}
            {activeCard && <KanbanCard card={activeCard} isActive />}
            {activeGroup && <KanbanGroup group={activeGroup} isActive />}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </KanbanBoardContext.Provider>
  );
};

export default KanbanBoard;
