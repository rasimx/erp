import { Active, DragMoveEvent, Over, useDndMonitor } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities/useSyntheticListeners';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from '@emotion/styled';
import { Card, CircularProgress, Paper, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import throttle from 'lodash/throttle';
import React, { ReactElement, useMemo } from 'react';

import { transientOptions } from '@/utils';

import KanbanCard, { getCardSortId } from './KanbanCard';
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

const Group = styled(Card, transientOptions)<{ $showAfter: boolean }>`
  height: 100%;
  overflow: auto;
  flex-grow: 1;
  background-color: rgba(0, 0, 0, 0.1);
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

export const isInsteadGroup = (active: Active | null, over: Over | null) => {
  if (!(active && over)) return;
  const overRect = over.rect;
  const activeTranslated = active?.rect.current.translated;
  return !!(
    overRect &&
    activeTranslated &&
    activeTranslated.top < overRect.top + 10
  );
};

export type Props<
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
> = {
  group: Group;
  renderGroupTitle: (
    group: Group,
    sortableData?: {
      listeners?: SyntheticListenerMap;
      setActivatorNodeRef: (element: HTMLElement | null) => void;
    },
  ) => ReactElement;
  getGroupItems: (group: Group) => Card[];
  loading?: boolean;
  renderCard: (
    data: Card,
    sortableData?: {
      listeners?: SyntheticListenerMap;
      setActivatorNodeRef: (element: HTMLElement | null) => void;
    },
  ) => ReactElement;
  isActive?: boolean;
  isForbiddenMove?: IsForbiddenFunc<Column, Group, Card>;
  getGroupId: (card: Card) => number | null;
};

export const getGroupSortId = (column: SortableType) => `group_${column.id}`;

const KanbanGroup = <
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
>({
  group,
  renderGroupTitle,
  getGroupItems,
  loading,
  renderCard,
  isForbiddenMove,
  getGroupId,
}: Props<Column, Group, Card>) => {
  const items = getGroupItems(group);
  const itemsIds = items.map(item => getCardSortId(item));
  const id = getGroupSortId(group);
  const [isInstead, setIsInstead] = React.useState<boolean | undefined>(false);

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
    isSorting,
    over,
    overIndex,
    activeIndex,
  } = useSortable({
    id,
    data: {
      type: DraggableType.Group,
      data: group,
    },
  });

  // todo: поправить время сработки
  useDndMonitor({
    onDragMove: throttle((event: DragMoveEvent) => {
      if (isOver) {
        const isInstead = isInsteadGroup(event.active, over);
        setIsInstead(isInstead);
      }
    }, 300),
  });

  const showPrev = useMemo(() => {
    const isNotNextItem =
      (overIndex != -1 && activeIndex != -1 && overIndex - activeIndex != 1) ||
      overIndex == -1 ||
      activeIndex == -1;
    return isOver && isInstead === true && isNotNextItem;
  }, [isOver, isInstead, overIndex, activeIndex]);

  const showOver = useMemo(() => {
    const lastCardId = items?.length
      ? getCardSortId(items[items.length - 1])
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

    return (
      isOver &&
      activeIsCard &&
      lastCardId != active?.id &&
      !forbidden &&
      isInstead === false
    );
  }, [isOver, isForbiddenMove, isInstead]);

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
      <Group
        $showAfter={showOver}
        elevation={3}
        variant="elevation"
        ref={setNodeRef}
        style={style}
        sx={{
          width: 280,
          position: 'relative',
          minHeight: '250px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            background: '#FAFAFA',
            // p: 1,
            textAlign: 'center',
          }}
          {...attributes}
        >
          {renderGroupTitle(group, { setActivatorNodeRef, listeners })}
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
                  getGroupId={getGroupId}
                  render={renderCard}
                />
              ))}
            </SortableContext>
          </Stack>
        </Box>
      </Group>
    </React.Fragment>
  );
};
export default KanbanGroup;
