import { Modifier } from '@dnd-kit/core';
import { DataRef } from '@dnd-kit/core/dist/store/types';
import { ReactElement } from 'react';

export enum DraggableType {
  Column = 'column',
  Group = 'group',
  Card = 'card',
}

export type SortableType = { id: number; order: number };

export type KanbanOptions<
  Column extends SortableType,
  Group extends SortableType,
  Card extends SortableType,
> = {
  columns: Column[];
  moveColumn: (active: Column, over: Column) => void;
  getColumnTitle: (column: Column) => string;
  isGroup: (item: Group | Card) => boolean;
  getGroupTitle: (group: Group) => string;
  getGroupItems: (group: Group) => Card[];
  moveGroup: (data: { id: number; columnId: number; order?: number }) => void;
  moveCard: (data: { id: number; columnId: number; order?: number }) => void;
  items: (Group | Card)[];
  getColumnId: (card: Group | Card) => number;
  getGroupId: (card: Card) => number;
  setColumnId: (card: Group | Card, newColumnId: number) => void;
  renderCard: (data: Card) => ReactElement;
};

// export type ColumnOptions<Column extends SortableType> = {
//   items: Column[];
//   move: (active: Column, over: Column) => void;
//   getTitle: (column: Column) => string;
// };
//
// export type CardOptions<
//   Group extends SortableType,
//   Card extends SortableType,
// > = {
//   items: (Group | Card)[];
//   isGroup: (item: Group | Card) => boolean;
//   getGroupTitle: (group: Group) => string;
//   getGroupItems: (group: Group) => Card[];
//   move: (data: { id: number; columnId: number; order?: number }) => void;
//   getColumnId: (card: Group | Card) => number;
//   setColumnId: (card: Group | Card, newColumnId: number) => void;
//   renderItem: (data: Card) => ReactElement;
// };

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
> = (options: MoveOptions<Column, Group, Card>) => Modifier[] | undefined;
