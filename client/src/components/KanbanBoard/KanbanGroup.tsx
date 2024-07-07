import { Active, Over } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CircularProgress, Paper, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import React, { ReactElement, useMemo } from 'react';

import KanbanCard, { getCardId } from './KanbanCard';
import { DraggableType, IsForbiddenFunc, SortableType } from './types';

const Preloader = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,.5)',
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export const isInsteadGroup = (active: Active | null, over: Over | null) => {
  if (!(active && over)) return;
  const overRect = over.rect;
  const activeTranslated = active?.rect.current.translated;
  return (
    overRect &&
    activeTranslated &&
    Math.abs(overRect.top - activeTranslated.top) <
      Math.abs(overRect.bottom - activeTranslated.bottom) + 50
  );
};

export type Props<
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
> = {
  group: Group;
  getGroupTitle: (group: Group) => string;
  getGroupItems: (group: Group) => Card[];
  loading?: boolean;
  renderCard: (data: Card) => ReactElement;
  isActive?: boolean;
  isForbiddenMove?: IsForbiddenFunc<Column, Group, Card>;
};

export const getGroupId = (column: SortableType) => `group_${column.id}`;

const KanbanGroup = <
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
>({
  group,
  getGroupTitle,
  getGroupItems,
  loading,
  isActive,
  renderCard,
  isForbiddenMove,
}: Props<Column, Group, Card>) => {
  const items = getGroupItems(group);
  const itemsIds = items.map(item => getCardId(item));
  const id = getGroupId(group);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    active,
    isOver,
    isSorting,
    over,
    overIndex,
    activeIndex,
    rect,
  } = useSortable({
    id,
    data: {
      type: DraggableType.Group,
      data: group,
    },
  });

  const show = useMemo(() => {
    const lastCardId = items?.length
      ? getCardId(items[items.length - 1])
      : undefined;

    const activeIsCard = active?.data.current?.type == DraggableType.Card;

    const forbidden =
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
      });

    return isOver && activeIsCard && lastCardId != active?.id && !forbidden;
  }, [isOver, items, over, isForbiddenMove]);

  const showPrev = useMemo(() => {
    return show && isInsteadGroup(active, over);
  }, [show, active, over]);
  const showAfter = useMemo(() => {
    return show && !isInsteadGroup(active, over);
  }, [show, active, over]);
  // const showPrev = useMemo(() => {
  //   const forbidden =
  //     isForbiddenMove &&
  //     isForbiddenMove({
  //       active: {
  //         type: active?.data.current?.type,
  //         data: active?.data.current?.data,
  //       },
  //       over: {
  //         type: over?.data.current?.type,
  //         data: over?.data.current?.data,
  //       },
  //     });
  //   return (
  //     isOver &&
  //     ((overIndex != -1 && activeIndex != -1 && overIndex - activeIndex != 1) ||
  //       overIndex == -1 ||
  //       activeIndex == -1) &&
  //     !forbidden
  //   );
  // }, [isOver, overIndex, activeIndex, isForbiddenMove, active, over]);

  const style = {
    transition,
    transform: isSorting ? undefined : CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <Card
        elevation={3}
        ref={setNodeRef}
        style={style}
        sx={{ height: 150, backgroundColor: 'rgba(0,0,0,.1)' }}
      >
        {group.id}
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
      <Box
        // component={isActive ? Paper : Box}
        component={Card}
        elevation={3}
        variant="elevation"
        ref={setNodeRef}
        style={style}
        sx={{
          width: 280,
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(0,0,0,.1)',
        }}
      >
        <Box
          sx={{
            background: '#FAFAFA',
            // p: 1,
            textAlign: 'center',
            cursor: 'grab',
          }}
          {...attributes}
          {...listeners}
        >
          {getGroupTitle(group)}
          {loading && <Preloader />}
        </Box>
        <Box>
          <Stack spacing={2} sx={{ p: 1 }}>
            <SortableContext items={itemsIds}>
              {items.map(card => (
                <KanbanCard
                  card={card}
                  key={card.id}
                  isForbiddenMove={isForbiddenMove}
                  render={renderCard}
                />
              ))}
            </SortableContext>

            {showAfter && (
              <Card
                elevation={3}
                sx={{
                  height: 5,
                  backgroundColor: 'rgba(0,255,0,.5)',
                }}
              ></Card>
            )}
          </Stack>
        </Box>
      </Box>
    </React.Fragment>
  );
};
export default KanbanGroup;
