import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CircularProgress, Paper, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import React, { ReactElement, useMemo } from 'react';

import KanbanCard, { getCardId } from './KanbanCard';
import KanbanGroup, { getGroupId } from './KanbanGroup';
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

export type Props<
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
> = {
  items: (Card | Group)[];
  column: Column;
  getTitle: (column: Column) => string;
  getGroupTitle: (group: Group) => string;
  getGroupItems: (group: Group) => Card[];
  isGroup: (cardOrGroup: Card | Group) => boolean;
  loading?: boolean;
  renderCard: (data: Card) => ReactElement;
  isActive?: boolean;
  isForbiddenMove?: IsForbiddenFunc<Column, Group, Card>;
};

export const getColumnId = (column: SortableType) => `column_${column.id}`;

const KanbanColumn = <
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
>({
  items,
  column,
  getTitle,
  getGroupTitle,
  getGroupItems,
  isGroup,
  loading,
  isActive,
  renderCard,
  isForbiddenMove,
}: Props<Column, Group, Card>) => {
  const itemsIds = useMemo(
    () =>
      items.map(item => (isGroup(item) ? getGroupId(item) : getCardId(item))),
    [items],
  );

  const id = getColumnId(column);

  const {
    setNodeRef,
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
        ? getGroupId(items[items.length - 1])
        : getCardId(items[items.length - 1])
      : undefined;

    const activeCard =
      active?.data.current?.type == DraggableType.Card
        ? active.data.current.data
        : null;

    return (
      isOver &&
      activeCard &&
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
  };

  if (isDragging) {
    return (
      <Box
        // elevation={3}
        // variant="elevation"
        ref={setNodeRef}
        style={style}
        sx={{ width: 300 }}
      ></Box>
    );
  }

  return (
    <Box
      component={isActive ? Paper : Box}
      elevation={3}
      variant="elevation"
      ref={setNodeRef}
      style={style}
      sx={{
        width: 300,
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
        {getTitle(column)}
        {loading && <Preloader />}
      </Box>
      <Box sx={{ height: '100%', overflow: 'auto', flexGrow: 1 }}>
        <Stack spacing={2} sx={{ p: 1 }}>
          <SortableContext items={itemsIds}>
            {items.map(item =>
              isGroup(item) ? (
                <KanbanGroup
                  group={item as Group}
                  isForbiddenMove={isForbiddenMove}
                  getGroupTitle={getGroupTitle}
                  getGroupItems={getGroupItems}
                  key={`group_${item.id}`}
                  renderCard={renderCard}
                />
              ) : (
                <KanbanCard
                  card={item as Card}
                  key={`card_${item.id}`}
                  isForbiddenMove={isForbiddenMove}
                  render={renderCard}
                />
              ),
            )}
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
  );
};
export default KanbanColumn;
