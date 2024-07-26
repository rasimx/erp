import { Active, Over } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@mui/material';
import React, { useMemo } from 'react';

import { DraggableType, SortableType, useKanbanBoardContext } from './types';

export interface Props<Card extends SortableType> {
  card: Card;
  isActive?: boolean;
  onChangeStyles?: (active: Active, over: Over) => void;
}

export const getCardSortId = (item: SortableType) => `card_${item.id}`;

const KanbanCard = <Card extends SortableType>({
  card,
  isActive = false,
}: Props<Card>) => {
  const { renderCard, isForbiddenMove, getGroupId } = useKanbanBoardContext<
    never,
    never,
    Card
  >();

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
    const activeIsGroup = active?.data.current?.type == DraggableType.Group;
    const onlyCardInGroup = activeIsCard || (activeIsGroup && !groupId);

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
      <Card ref={setNodeRef} {...attributes} style={style} elevation={3}>
        {renderCard({
          card,
          isActive,
          sortableData: { listeners, setActivatorNodeRef },
        })}
      </Card>
    </React.Fragment>
  );
};
export default KanbanCard;
