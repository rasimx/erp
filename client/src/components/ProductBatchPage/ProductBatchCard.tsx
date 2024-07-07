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
import React from 'react';

import { ProductBatchFragment } from '../../gql-types/graphql';

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

export interface Props {
  card: ProductBatchFragment;
  loading?: boolean;
}

export const ProductBatchCard = React.memo<Props>(({ card, loading }) => {
  return (
    <>
      <Card
        elevation={3}
        sx={{
          cursor: 'grab',
          position: 'relative',
          height: 180,
          backgroundColor: 'rgba(0,0,255,.1)',
        }}
      >
        {loading && <Preloader />}
        <CardContent>
          <strong>{card.name}</strong>
          {/*<strong>{card.order}</strong>*/}

          <List dense>
            <ListItem
              disableGutters
              secondaryAction={<Typography>{card.id}</Typography>}
            >
              <ListItemText primary="id" />
            </ListItem>
            <ListItem
              disableGutters
              secondaryAction={<Typography>{card.statusId}</Typography>}
            >
              <ListItemText primary="statusId" />
            </ListItem>
            <ListItem
              disableGutters
              secondaryAction={<Typography>{card.order}</Typography>}
            >
              <ListItemText primary="order" />
            </ListItem>

            {/*<ListItem disableGutters>*/}
            {/*  <ListItemText*/}
            {/*    primary={card.product.sku}*/}
            {/*    secondary={card.product.name}*/}
            {/*  />*/}
            {/*</ListItem>*/}
            {/*<ListItem*/}
            {/*  disableGutters*/}
            {/*  secondaryAction={<Typography>{card.count}</Typography>}*/}
            {/*>*/}
            {/*  <ListItemText primary="количество" />*/}
            {/*</ListItem>*/}
            {/*<ListItem*/}
            {/*  disableGutters*/}
            {/*  secondaryAction={*/}
            {/*    <Typography>{(card.costPrice / 100).toFixed(2)}</Typography>*/}
            {/*  }*/}
            {/*>*/}
            {/*  <ListItemText primary="цена закупки" />*/}
            {/*</ListItem>*/}
            {/*<ListItem*/}
            {/*  disableGutters*/}
            {/*  secondaryAction={*/}
            {/*    <Typography>{(card.pricePerUnit / 100).toFixed(2)}</Typography>*/}
            {/*  }*/}
            {/*>*/}
            {/*  <ListItemText primary="с/с единицы" />*/}
            {/*</ListItem>*/}
            {/*<ListItem*/}
            {/*  disableGutters*/}
            {/*  secondaryAction={*/}
            {/*    <Typography>{(card.fullPrice / 100).toFixed(2)}</Typography>*/}
            {/*  }*/}
            {/*>*/}
            {/*  <ListItemText primary="с/с партии" />*/}
            {/*</ListItem>*/}
          </List>
        </CardContent>
      </Card>
    </>
  );
});
