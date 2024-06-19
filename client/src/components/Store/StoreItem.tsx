import styled from '@emotion/styled';
import { Card, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import React, { type FC, useMemo } from 'react';

import AddProductBatch from '@/components/Kanban/AddProductBatch/AddProductBatch';
import { getFragmentData } from '@/gql-types';
import { StoreType } from '@/gql-types/graphql';

import { StoreItemFragment, StoreItemType } from './store.gql';

const Item = styled(Card)<StoreItemType>`
  padding: 10px;
  flex-shrink: 0;
  width: 280px;
  position: relative;
`;

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
  storeItem: StoreItemType;
  storeId: number;
  storeType: StoreType;
}

const StoreItem: FC<Props> = props => {
  const storeItem = getFragmentData(StoreItemFragment, props.storeItem);

  const maxCount = useMemo(
    () =>
      storeItem.salesCount +
      storeItem.inStoreCount -
      storeItem.productBatches.reduce((prev, cur) => prev + cur.count, 0),
    [],
  );

  const min = Math.min(...storeItem.productBatches.map(item => item.count));
  const h = 100;

  const productBatches = useMemo(() => {
    let salesCount = storeItem.salesCount;
    return storeItem.productBatches.map(item => {
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
  }, [storeItem]);

  return (
    <Item {...storeItem}>
      <Stack spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
        {storeItem.product.sku}
        <br />
        всего: {storeItem.salesCount + storeItem.inStoreCount}
        <br />
        продано: {storeItem.salesCount}
        <br />
        на складе: {storeItem.inStoreCount}
        {maxCount > 0 && (
          <AddProductBatch
            storeId={Number(props.storeId)}
            storeType={props.storeType}
            productId={storeItem.product.id}
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
