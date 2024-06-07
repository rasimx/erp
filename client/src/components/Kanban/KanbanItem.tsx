import styled from '@emotion/styled';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import React, { type FC, useCallback, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { type ProductBatch } from '../../gql-types/graphql';
import { useAppDispatch } from '../../hooks';
import {
  deleteProductBatchAsync,
  ProductBatchItemState,
  toggleCheck,
} from './product-batch.slice';

export interface Props {
  item: ProductBatchItemState;
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
    <Container ref={ref}>
      <Checkbox
        checked={item.checked}
        onChange={handleCheckbox}
        inputProps={{ 'aria-label': 'controlled' }}
      />

      <strong>{item.id}</strong>
      {!item.parentId && (
        <IconButton aria-label="delete" onClick={onClickDeleteBtn}>
          <DeleteIcon />
        </IconButton>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>{item.product.sku}</strong> {item.product.name}
      </div>

      <br />
      <Row>
        <div>кол-во</div>
        <div>{item.count} шт</div>
      </Row>
      <Row>
        <div>цена закупки</div>
        <div>{(item.costPrice / 100).toFixed(2)} &#8381;</div>
      </Row>
      <Row>
        <div>с/с единицы</div>
        <div>{(item.pricePerUnit / 100).toFixed(2)} &#8381;</div>
      </Row>
      <Row>
        <div>с/с партии</div>
        <div>{(item.fullPrice / 100).toFixed(2)} &#8381;</div>
      </Row>
    </Container>
  );
};

export default KanbanItem;
