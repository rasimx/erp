import { Active, Over } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Card } from '@mui/material';
import Box from '@mui/material/Box';
import React, { ReactElement, useMemo } from 'react';

import { DraggableType, IsForbiddenFunc, SortableType } from './types';

export interface Props<
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
> {
  card: Card;
  render: (data: Card) => ReactElement;
  isForbiddenMove?: IsForbiddenFunc<Column, Group, Card>;
  getGroupId: (card: Card) => number | null;
  onChangeStyles?: (active: Active, over: Over) => void;
}

export const getCardSortId = (item: SortableType) => `card_${item.id}`;

const KanbanCard = <
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
>({
  card,
  render,
  isForbiddenMove,
  getGroupId,
}: Props<Column, Group, Card>) => {
  const id = getCardSortId(card);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    active,
    over,
    isOver,
    overIndex,
    activeIndex,
    isSorting,
    setActivatorNodeRef,
  } = useSortable({
    id,
    animateLayoutChanges: () => true,
    data: {
      type: DraggableType.Card,
      data: card,
    },
  });

  const style = {
    transition,
    transform: isSorting ? undefined : CSS.Translate.toString(transform),
  };

  const showPrev = useMemo(() => {
    const groupId = getGroupId(card);
    const activeIsCard = active?.data.current?.type == DraggableType.Card;
    const onlyCardInGroup = activeIsCard || (!activeIsCard && !groupId);

    const isNotNextItem =
      (overIndex != -1 && activeIndex != -1 && overIndex - activeIndex != 1) ||
      overIndex == -1 ||
      activeIndex == -1;

    return (
      isOver &&
      onlyCardInGroup &&
      isNotNextItem &&
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
  }, [isOver, overIndex, activeIndex, isForbiddenMove, active, over]);

  if (isDragging) {
    return (
      <Card
        elevation={3}
        ref={setNodeRef}
        style={style}
        sx={{ height: 150, backgroundColor: 'rgba(0,0,0,.1)' }}
      >
        {card.id}
      </Card>
    );
  }

  return (
    <React.Fragment>
      {showPrev && (
        <Card
          elevation={3}
          sx={{
            height: 5,
            backgroundColor: 'rgba(0,255,0,.5)',
            marginBottom: 1,
          }}
        ></Card>
      )}
      <Card
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        elevation={3}
        // sx={{ backgroundColor: 'rgba(0,0,0,.1)', p: 1 }}
      >
        {/*<Button ref={setActivatorNodeRef} {...listeners}>*/}
        {/*  AAAA*/}
        {/*</Button>*/}
        {render(card)}
      </Card>
    </React.Fragment>
  );
};
export default KanbanCard;
