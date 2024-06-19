import styled from '@emotion/styled';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Card,
  CardActions,
  CardContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import React, { type FC, useCallback, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { type ProductBatch } from '@/gql-types/graphql';
import { useAppDispatch } from '@/hooks';

import AddProductBatch from './AddProductBatch/AddProductBatch';
import {
  deleteProductBatchAsync,
  ProductBatchStateItem,
  toggleCheck,
} from './product-batch.slice';

export interface Props {
  item: ProductBatchStateItem;
}

const Container = styled.div`
  background: #fff;
  margin: 20px;
  padding: 10px;
  text-wrap: nowrap;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;

function CommentIcon() {
  return null;
}

const KanbanItem: FC<Props> = ({ item }) => {
  const ref = useRef(null);
  const [opacity, setOpacity] = useState(1);
  const dispatch = useAppDispatch();

  const onClickDeleteBtn = useCallback(() => {
    void dispatch(deleteProductBatchAsync(item.id));
  }, []);
  const handleCheckbox = useCallback(() => {
    void dispatch(toggleCheck(item.id));
  }, []);

  const [_, drag] = useDrag<{ id: number }>({
    type: 'card',
    item,
    end: (draggedItem, monitor) => {
      setTimeout(() => {
        setOpacity(1);
      }, 100);
    },

    collect: monitor => {
      if (monitor.isDragging()) setOpacity(0);
      return {
        isDragging: monitor.isDragging(),
      };
    },
  });
  drag(ref);

  const [, drop] = useDrop({
    accept: 'card',
    drop(droppedItem: ProductBatch) {
      console.log('AAAA');
      // dispatch(
      //   mergeProductBatchAsync({
      //     firstProductBatchId: item.id,
      //     secondProductBatchId: droppedItem.id,
      //   }),
      // );
    },
  });
  drop(ref);

  return (
    <Card ref={ref} elevation={3}>
      <CardContent>
        <strong>{item.name}</strong>

        <List dense>
          <ListItem disableGutters>
            <ListItemText primary={item.id} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              primary={item.product.sku}
              secondary={item.product.name}
            />
          </ListItem>
          <ListItem
            disableGutters
            secondaryAction={<Typography>{item.count}</Typography>}
          >
            <ListItemText primary="количество" />
          </ListItem>
          <ListItem
            disableGutters
            secondaryAction={
              <Typography>{(item.costPrice / 100).toFixed(2)}</Typography>
            }
          >
            <ListItemText primary="цена закупки" />
          </ListItem>
          <ListItem
            disableGutters
            secondaryAction={
              <Typography>{(item.pricePerUnit / 100).toFixed(2)}</Typography>
            }
          >
            <ListItemText primary="с/с единицы" />
          </ListItem>
          <ListItem
            disableGutters
            secondaryAction={
              <Typography>{(item.fullPrice / 100).toFixed(2)}</Typography>
            }
          >
            <ListItemText primary="с/с партии" />
          </ListItem>
        </List>
      </CardContent>
      <Divider />
      <CardActions>
        <Checkbox
          checked={item.checked}
          onChange={handleCheckbox}
          inputProps={{ 'aria-label': 'controlled' }}
        />
        {!item.parentId && (
          <IconButton aria-label="delete" onClick={onClickDeleteBtn}>
            <DeleteIcon />
          </IconButton>
        )}
        <AddProductBatch parent={item} />
      </CardActions>
    </Card>
  );
};

export default KanbanItem;
