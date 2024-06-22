import { UniqueIdentifier } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CircularProgress, Paper, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import React, { FC } from 'react';

import { Status } from '../../gql-types/graphql';
import { DraggableType } from './types';

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

export type Props = {
  items: UniqueIdentifier[];
  column: Status;
  loading?: boolean;
  children?: React.ReactNode;
};

const KanbanColumn: FC<Props> = ({ items, column, loading, children }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column_${column.id}`,
    data: {
      type: DraggableType.Column,
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <Paper
        elevation={3}
        variant="elevation"
        ref={setNodeRef}
        style={style}
        sx={{ width: 300 }}
      ></Paper>
    );
  }

  return (
    <Paper
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
          p: 1,
          textAlign: 'center',
          cursor: 'grab',
        }}
        {...attributes}
        {...listeners}
      >
        {column.title}
        {loading && <Preloader />}
      </Box>
      <Box sx={{ height: '100%', overflow: 'auto', flexGrow: 1 }}>
        <Stack spacing={2} sx={{ p: 1 }}>
          <SortableContext items={items}>{children}</SortableContext>
        </Stack>
      </Box>
    </Paper>
  );
};
export default KanbanColumn;
