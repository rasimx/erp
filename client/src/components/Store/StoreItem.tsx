import styled from '@emotion/styled';
import { Card, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import React, { type FC, useMemo } from 'react';

import { StoreStateQuery, StoreType } from '../../gql-types/graphql';
import AddProductBatch from '../Kanban/AddProductBatch/AddProductBatch';

export type DataItem = StoreStateQuery['storeState'][0]['items'][0];

const Item = styled(Card)<DataItem>`
  padding: 10px;
  flex-shrink: 0;
  width: 280px;
  position: relative;
`;

// &:before {
//   content: '${props => props.salesCount}';
//   position: absolute;
//   display: block;
//   width: 100%;
//   height: ${props =>
//     (props.salesCount * 100) / (props.inStoreCount + props.salesCount) || 0}%;
//   left: 0;
//   top: 0;
//   background: rgba(164, 229, 105, 0.5);
// }
//
// &:after {
//   content: '${props => props.inStoreCount}';
//   position: absolute;
//   display: block;
//   width: 100%;
//   height: ${props =>
//     (props.inStoreCount * 100) / (props.inStoreCount + props.salesCount) ||
//     0}%;
//   left: 0;
//   bottom: 0;
//   background: rgba(238, 165, 69, 0.57);
// }

const BatchItem = styled(Card)<{ beforeh: number }>`
  //background: rgba(238, 165, 69, 0.57);
  background: rgba(141, 207, 227, 0.5);
  position: relative;

  &:before {
    content: '';
    position: absolute;
    display: block;
    width: 100%;
    height: ${props => props.beforeh + '%'};
    left: 0;
    top: 0;
    //background: rgba(193, 255, 218, 0.5);
    background: rgba(223, 240, 216, 1);
  }
`;

interface Props {
  data: DataItem;
  storeId: number;
  storeType: StoreType;
}

const StoreItem: FC<Props> = ({ data, storeType, storeId }) => {
  const maxCount = useMemo(
    () =>
      data.salesCount +
      data.inStoreCount -
      data.productBatches.reduce((prev, cur) => prev + cur.count, 0),
    [],
  );

  const min = Math.min(...data.productBatches.map(item => item.count));
  const h = 100;

  const productBatches = useMemo(() => {
    let salesCount = data.salesCount;
    return data.productBatches.map(item => {
      const beforeh = (salesCount * 100) / item.count;
      const sales = beforeh > 0 ? Math.min(salesCount, item.count) : 0;
      salesCount = Math.max(salesCount - item.count, 0);
      return {
        ...item,
        height: (item.count / min) * h,
        beforeh,
        sales,
        inStore: item.count - sales,
      };
    });
  }, [data]);

  return (
    <Item {...data}>
      <Stack spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
        {data.product.sku}
        <br />
        всего: {data.salesCount + data.inStoreCount}
        <br />
        продано: {data.salesCount}
        <br />
        на складе: {data.inStoreCount}
        {maxCount > 0 && (
          <AddProductBatch
            storeId={Number(storeId)}
            storeType={storeType}
            productId={data.product.id}
            maxCount={maxCount}
          />
        )}
        {productBatches.map(item => (
          <BatchItem sx={{ height: 200, p: 1 }} beforeh={item.beforeh}>
            <Box sx={{ position: 'relative' }}>
              <strong>{item.name}</strong>
              <br />
              Всего: {item.count}
              <br />
              Продано: {item.sales}
              <br />
              Остаток: {item.inStore}
              <br />
              C/c единицы: {(item.pricePerUnit / 100).toFixed(2)}
              <br />
              C/c партии: {(item.fullPrice / 100).toFixed(2)}
            </Box>
          </BatchItem>
        ))}
      </Stack>
    </Item>
  );
};

export default StoreItem;
