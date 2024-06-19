import Box from '@mui/material/Box';
import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';

import { type ProductBatch, type Status } from '@/gql-types/graphql';
import { useAppDispatch } from '@/hooks';

import { updateProductBatchAsync } from './product-batch.slice';

const KanbanColumn = ({
  status,
  children,
}: {
  status: Status;
  children: any;
}) => {
  const ref = useRef(null);
  const dispatch = useAppDispatch();
  const [, drop] = useDrop<ProductBatch>({
    accept: 'card',
    hover(item, monitor) {
      // const a = monitor.isOver({ shallow: true });
      // console.log(monitor, a);
    },
    drop(item: ProductBatch, monitor) {
      if (monitor.isOver()) {
        dispatch(updateProductBatchAsync({ id: item.id, statusId: status.id }));
      }
    },
  });
  drop(ref);
  return (
    <Box ref={ref} sx={{ width: 300 }}>
      {children}
    </Box>
  );
};

export default KanbanColumn;
