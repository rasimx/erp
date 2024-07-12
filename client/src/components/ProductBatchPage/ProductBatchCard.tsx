import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';

import { useProductBatch } from '../../api/product-batch/product-batch.hook';
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
  refetch: () => void;
  loading?: boolean;
}

export const ProductBatchCard = React.memo<Props>(props => {
  const { card, loading, refetch } = props;
  const { deleteProductBatch } = useProductBatch();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDelete = () => {
    deleteProductBatch(card.id).then(() => {
      handleClose();
      refetch();
    });
  };

  return (
    <>
      <Card
        elevation={3}
        sx={{
          cursor: 'grab',
          position: 'relative',
          height: 280,
          backgroundColor: 'rgba(0,0,255,.1)',
        }}
      >
        {loading && <Preloader />}
        <>
          <IconButton
            aria-label="more"
            id="long-button"
            aria-controls={open ? 'long-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleClick}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="long-menu"
            MenuListProps={{
              'aria-labelledby': 'long-button',
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={handleDelete}>Удалить</MenuItem>
          </Menu>
        </>
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
            <ListItem
              disableGutters
              secondaryAction={<Typography>{card.count}</Typography>}
            >
              <ListItemText primary="количество" />
            </ListItem>
            <ListItem
              disableGutters
              secondaryAction={
                <Typography>{card.costPricePerUnit} р</Typography>
              }
            >
              <ListItemText primary="цена закупки" />
            </ListItem>
            {/*<ListItem*/}
            {/*  disableGutters*/}
            {/*  secondaryAction={*/}
            {/*    <Typography>{(card.pricePerUnit / 100).toFixed(2)}</Typography>*/}
            {/*  }*/}
            {/*>*/}
            {/*  <ListItemText primary="с/с единицы" />*/}
            {/*</ListItem>*/}
            <ListItem
              disableGutters
              secondaryAction={<Typography>241 р</Typography>}
            >
              <ListItemText primary="с/с партии" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </>
  );
});
