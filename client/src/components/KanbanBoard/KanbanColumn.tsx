import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from '@emotion/styled';
import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useEffect, useMemo } from 'react';

import { transientOptions } from '@/utils';

import KanbanCard, { getCardSortId } from './KanbanCard';
import KanbanGroup, { getGroupSortId } from './KanbanGroup';
import { DraggableType, SortableType, useKanbanBoardContext } from './types';

const Column = styled(Box, transientOptions)<{ $showAfter: boolean }>`
  height: 100%;
  flex-grow: 1;
  background-color: rgba(0, 0, 0, 0.1);
  width: 300px;
  position: relative;
  flex-shrink: 0;
  flex-grow: 0;
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

  // useEffect(() => {
  //   console.log('column', isActive);
  // }, [column]);
  // useEffect(() => {
  //   console.log('items', isActive);
  // }, [items]);
  // useEffect(() => {
  //   console.log('isActive', isActive);
  // }, [isActive]);
  // useEffect(() => {
  //   console.log('setActivatorNodeRef', isActive);
  // }, [setActivatorNodeRef]);
  // useEffect(() => {
  //   // console.log('listeners', listeners, isActive);
  // }, [listeners]);
  // useEffect(() => {
  //   console.log('itemsIds', isActive);
  // }, [itemsIds]);

  // const renderedColumn = useMemo(() => {
  //   return renderColumn({
  //     column,
  //     items,
  //     isActive,
  //     sortableData: { setActivatorNodeRef, listeners },
  //     children: (
  //       <Stack spacing={2} sx={{ p: 1 }}>
  //         <SortableContext items={itemsIds}>
  //           {items.map(item =>
  //             isGroup(item) ? (
  //               <KanbanGroup group={item as Group} key={`group_${item.id}`} />
  //             ) : (
  //               <KanbanCard card={item as Card} key={`card_${item.id}`} />
  //             ),
  //           )}
  //         </SortableContext>
  //       </Stack>
  //     ),
  //   });
  // }, [column, items, isActive, setActivatorNodeRef, listeners, itemsIds]);

  // if (isDragging) {
  //   return (
  //     <Box
  //       // elevation={3}
  //       // variant="elevation"
  //       ref={setNodeRef}
  //       style={style}
  //       sx={{ width: 300 }}
  //     ></Box>
  //   );
  // }

  return (
    <Column
      $showAfter={showAfter}
      ref={setNodeRef}
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
          <Box
            sx={{
              overflowY: 'auto',
              overflowX: 'visible',
            }}
          >
            <Stack spacing={2} sx={{ p: 1 }}>
              <SortableContext items={itemsIds}>
                {items.map(item =>
                  isGroup(item) ? (
                    <KanbanGroup
                      group={item as Group}
                      key={`group_${item.id}`}
                    />
                  ) : (
                    <KanbanCard card={item as Card} key={`card_${item.id}`} />
                  ),
                )}
              </SortableContext>
            </Stack>
          </Box>
        ),
      })}
    </Column>
  );
};
export default KanbanColumn;
