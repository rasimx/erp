import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import cx from 'clsx';
import React, { useMemo } from 'react';

import KanbanCard, { getCardSortId } from './KanbanCard';
import classes from './KanbanColumn.module.scss';
import KanbanGroup, { getGroupSortId } from './KanbanGroup';
import { DraggableType, SortableType, useKanbanBoardContext } from './types';

export type Props<
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
> = {
  cards: (Card | Group)[];
  column: Column;
  isActive?: boolean;
};

export const getSortableColumnId = (column: SortableType) =>
  `column_${column.id}`;

const KanbanColumn = <
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
>({
  cards,
  column,
  isActive = false,
}: Props<Column, Group, Card>) => {
  const { isForbiddenMove, isGroup, renderColumn, getColumnId } =
    useKanbanBoardContext<Column, Group, Card>();

  const items = useMemo(
    () => cards.filter(card => getColumnId(card) == column.id),
    [cards],
  );

  const itemsIds = useMemo(
    () =>
      items.map(item =>
        isGroup(item) ? getGroupSortId(item) : getCardSortId(item),
      ),
    [items],
  );

  const id = getSortableColumnId(column);

  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    active,
    isOver,
    over,
  } = useSortable({
    id,
    data: {
      type: DraggableType.Column,
      data: column,
    },
  });

  const showAfter = useMemo(() => {
    const lastItemId = items?.length
      ? isGroup(items[items.length - 1])
        ? getGroupSortId(items[items.length - 1])
        : getCardSortId(items[items.length - 1])
      : undefined;

    return (
      isOver &&
      active?.data.current?.type != DraggableType.Column &&
      lastItemId != active?.id &&
      !(
        isForbiddenMove &&
        isForbiddenMove({
          active: {
            type: active?.data.current?.type,
            data: active?.data.current?.data,
          },
          over: {
            type: over?.data.current?.type,
            data: over?.data.current?.data,
          },
        })
      )
    );
  }, [isOver, items, over, isForbiddenMove]);

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    visibility: isDragging ? 'hidden' : 'visible',
  };

  return (
    <div
      className={cx(classes.column, showAfter && classes.showAfter)}
      ref={setNodeRef}
      // $showAfter={showAfter}
      {...attributes}
      // @ts-expect-error .....
      style={style}
    >
      {renderColumn({
        column,
        items,
        isActive,
        sortableData: { setActivatorNodeRef, listeners },
        children: (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              overflowX: 'visible',
            }}
          >
            <SortableContext items={itemsIds}>
              {items.map(item =>
                isGroup(item) ? (
                  <KanbanGroup group={item as Group} key={`group_${item.id}`} />
                ) : (
                  <KanbanCard card={item as Card} key={`card_${item.id}`} />
                ),
              )}
            </SortableContext>
          </div>
        ),
      })}
    </div>
  );
};
export default KanbanColumn;
