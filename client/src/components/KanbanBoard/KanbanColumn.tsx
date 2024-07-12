import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled, { CreateStyled } from '@emotion/styled';
import { Card, CircularProgress, Paper, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import React, { ReactElement, useMemo } from 'react';

import { transientOptions } from '@/utils';

import KanbanCard, { getCardSortId } from './KanbanCard';
import KanbanGroup, { getGroupSortId } from './KanbanGroup';
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

const Column = styled(Box, transientOptions)<{ $showAfter: boolean }>`
  height: 100%;
  overflow: auto;
  flex-grow: 1;
  background-color: rgba(0, 0, 0, 0.1);
  width: 300px;
  position: relative;
  &::after {
    content: '';
    display: ${props => (props.$showAfter ? 'block' : 'none')};
    position: absolute;
    //background: rgba(0, 0, 0, 0.5);
    opacity: 0.2;
    background: repeating-linear-gradient(
      45deg,
      #606dbc,
      #606dbc 10px,
      #465298 10px,
      #465298 20px
    );
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
`;

export type Props<
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
> = {
  items: (Card | Group)[];
  column: Column;
  getColumnHeader: (column: Column) => ReactElement;
  renderGroupTitle: (group: Group) => ReactElement;
  getGroupItems: (group: Group) => Card[];
  getGroupId: (card: Card) => number | null;
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
  getColumnHeader,
  renderGroupTitle,
  getGroupItems,
  getGroupId,
  isGroup,
  loading,
  isActive,
  renderCard,
  isForbiddenMove,
}: Props<Column, Group, Card>) => {
  const itemsIds = useMemo(
    () =>
      items.map(item =>
        isGroup(item) ? getGroupSortId(item) : getCardSortId(item),
      ),
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
        {getColumnHeader(column)}
        {loading && <Preloader />}
      </Box>
      <Column $showAfter={showAfter}>
        <Stack spacing={2} sx={{ p: 1 }}>
          <SortableContext items={itemsIds}>
            {items.map(item =>
              isGroup(item) ? (
                <KanbanGroup
                  group={item as Group}
                  isForbiddenMove={isForbiddenMove}
                  renderGroupTitle={renderGroupTitle}
                  getGroupItems={getGroupItems}
                  key={`group_${item.id}`}
                  renderCard={renderCard}
                  getGroupId={getGroupId}
                />
              ) : (
                <KanbanCard
                  card={item as Card}
                  key={`card_${item.id}`}
                  isForbiddenMove={isForbiddenMove}
                  getGroupId={getGroupId}
                  render={renderCard}
                />
              ),
            )}
          </SortableContext>

          {/*{showAfter && (*/}
          {/*  <Card*/}
          {/*    elevation={3}*/}
          {/*    sx={{*/}
          {/*      height: 5,*/}
          {/*      backgroundColor: 'rgba(0,255,0,.5)',*/}
          {/*    }}*/}
          {/*  ></Card>*/}
          {/*)}*/}
        </Stack>
      </Column>
    </Box>
  );
};
export default KanbanColumn;
