import { Modifier } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities/useSyntheticListeners';
import { DataRef } from '@dnd-kit/core/dist/store/types';
import { once } from 'lodash';
import { createContext, ReactElement, useContext } from 'react';

export enum DraggableType {
  Column = 'column',
  Group = 'group',
  Card = 'card',
}

export type SortableType = { id: number; order?: number };

export type SortableData = {
  listeners?: SyntheticListenerMap;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
};

export type GroupProps<Group> = {
  group: Group;
  isActive: boolean;
  children: ReactElement;
  sortableData: SortableData;
};

export type ColumnProps<Column, Group, Card> = {
  items: (Card | Group)[];
  column: Column;
  children: ReactElement;
  isActive: boolean;
  sortableData: SortableData;
};

export type CardProps<Card> = {
  card: Card;
  isActive: boolean;
  sortableData: SortableData;
};

export type KanbanBoardProps<
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
> = {
  columnItems: Column[];
  moveColumn: (active: Column, over: Column) => void;
  renderColumn: (props: ColumnProps<Column, Group, Card>) => ReactElement;
  getColumnId: (card: Card | Group) => number | null;
  setColumnId: (card: Group | Card, newColumnId: number | null) => void;

  isGroup: (item: Group | Card) => boolean;
  renderGroup: (props: GroupProps<Group>) => ReactElement;
  getGroupItems: (group: Group) => Card[];
  setGroupItems: (group: Group, items: Card[]) => void;
  moveGroup: (data: { id: number; columnId: number; order?: number }) => void;
  getGroupId: (card: Card) => number | null;
  setGroupId: (card: Card, newGroupId: number | null) => void;

  moveCard: (data: {
    id: number;
    columnId: number | null;
    groupId: number | null;
    order?: number;
  }) => void;
  cardItems: (Group | Card)[];
  renderCard: (props: CardProps<Card>) => ReactElement;

  isForbiddenMove?: IsForbiddenFunc<Column, Group, Card>;
  modifiers?: ModifiersFunc<Column, Group, Card>;
};

export type A<Column extends SortableType> = {
  type: DraggableType.Column;
  data: Column;
};
export type B<Group extends SortableType> = {
  type: DraggableType.Group;
  data: Group;
};
export type C<Card extends SortableType> = {
  type: DraggableType.Card;
  data: Card;
};

export type SortableItem<
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
> = DataRef<A<Column> | B<Group> | C<Card>>;

export type MoveOptions<
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
> = {
  active: A<Column> | B<Group> | C<Card>;
  over: A<Column> | B<Group> | C<Card>;
};
export type IsForbiddenFunc<
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
> = (options: MoveOptions<Column, Group, Card>) => boolean | undefined | null;

export type ModifiersFunc<
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
> = (
  active: A<Column> | B<Group> | C<Card> | undefined,
) => Modifier[] | undefined;

export const createKanbanBoardContext = once(<
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
>() => createContext({} as KanbanBoardProps<Column, Group, Card>));

export const useKanbanBoardContext = <
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
>() => useContext(createKanbanBoardContext<Column, Group, Card>());
