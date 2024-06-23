import { Modifiers } from '@dnd-kit/core/dist/modifiers';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import React, { FC } from 'react';

import { ProductBatchFragment } from '../../gql-types/graphql';
import { DraggableType } from './types';

export const getCardId = (item: ProductBatchFragment) => `card_${item.id}`;

export interface Props {
  card: ProductBatchFragment;
  modifiers?: Modifiers;
  loading?: boolean;
}

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

export const DraggablePresentation = React.memo<Props>(({ card, loading }) => {
  return (
    <Card
      elevation={3}
      sx={{ height: 200, cursor: 'grab', position: 'relative' }}
    >
      {loading && <Preloader />}
      <CardContent>
        <strong>{card.name}</strong>
        <br />
        <strong>{card.id}</strong>
        <br />
        <strong>{card.order}</strong>

        <List dense>
          <ListItem disableGutters>
            <ListItemText primary={card.id} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary={card.product.sku}
              secondary={card.product.name}
            />
          </ListItem>
          <ListItem
            disableGutters
            secondaryAction={<Typography>{card.count}</Typography>}
          >
            <ListItemText primary="количество" />
          </ListItem>
          <ListItem
            disableGutters
            secondaryAction={
              <Typography>{(card.costPrice / 100).toFixed(2)}</Typography>
            }
          >
            <ListItemText primary="цена закупки" />
          </ListItem>
          <ListItem
            disableGutters
            secondaryAction={
              <Typography>{(card.pricePerUnit / 100).toFixed(2)}</Typography>
            }
          >
            <ListItemText primary="с/с единицы" />
          </ListItem>
          <ListItem
            disableGutters
            secondaryAction={
              <Typography>{(card.fullPrice / 100).toFixed(2)}</Typography>
            }
          >
            <ListItemText primary="с/с партии" />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
});

const KanbanCard: FC<Props> = ({ card, loading, modifiers }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: getCardId(card),
    data: {
      modifiers,
      type: DraggableType.Card,
      card,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <Card
        elevation={3}
        ref={setNodeRef}
        style={style}
        sx={{ height: 200, backgroundColor: 'rgba(255,0,0,.5)' }}
      >
        {card.id}
      </Card>
    );
  }

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <DraggablePresentation card={card} loading={loading} />
    </div>
  );
};
export default KanbanCard;
