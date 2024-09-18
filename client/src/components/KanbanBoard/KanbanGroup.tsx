import { Active, DragMoveEvent, Over, useDndMonitor } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import cx from 'clsx';
import throttle from 'lodash/throttle';
import React, { useMemo } from 'react';

import KanbanCard, { getCardSortId } from './KanbanCard';
import classes from './KanbanGroup.module.scss';
import { DraggableType, SortableType, useKanbanBoardContext } from './types';

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

export type Props<Group extends SortableType> = {
  group: Group;
  isActive?: boolean;
};

export const getGroupSortId = (column: SortableType) => `group_${column.id}`;

const KanbanGroup = <Group extends SortableType, Card extends SortableType>({
  group,
  isActive = false,
}: Props<Group>) => {
  const { isForbiddenMove, getGroupItems, renderGroup } = useKanbanBoardContext<
    never,
    Group,
    Card
  >();

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
    return (
      active?.data.current?.type != DraggableType.Column &&
      isOver &&
      isInstead === true &&
      isNotNextItem
    );
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
      <div ref={setNodeRef} style={style} className={classes.fake}>
        {group.id}
      </div>
    );
  }

  return (
    <React.Fragment>
      {showPrev && <div className={classes.prev} />}
      <div
        className={cx(classes.group, showOver && classes.showOver)}
        ref={setNodeRef}
        {...attributes}
      >
        {renderGroup({
          group,
          isActive,
          sortableData: { setActivatorNodeRef, listeners },
          children: (
            <div className={classes.cards}>
              <SortableContext items={itemsIds}>
                {items.map(card => (
                  <KanbanCard card={card} key={card.id} />
                ))}
              </SortableContext>
            </div>
          ),
        })}
      </div>
    </React.Fragment>
  );
};
export default KanbanGroup;
