import styled from '@emotion/styled';
import { Card, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import React, { type FC, useMemo } from 'react';
import { FullStateDtoFragment } from 'remoteOzon/full-state.api';

import {
  ProductBatchFragment,
  ProductFragment,
  StatusFragment,
} from '../../gql-types/graphql';
import { transientOptions } from '../../utils';
import ColumnHeader from './ColumnHeader';

export type A = {
  product: ProductFragment;
  productBatchList: ProductBatchFragment[];
  fullState: FullStateDtoFragment;
};

const Item = styled(Card)<A>`
  padding: 10px;
  flex-shrink: 0;
  width: 280px;
  position: relative;
`;

const BatchItem = styled(Card, transientOptions)<{ $beforeH: number }>`
  background: rgba(141, 207, 227, 0.5);
  position: relative;

  &:before {
    content: '';
    position: absolute;
    display: block;
    width: 100%;
    height: ${props => props.$beforeH + '%'};
    left: 0;
    top: 0;
    background: rgba(223, 240, 216, 1);
  }
`;

interface Props {
  item: A;
  status: StatusFragment;
}

const Column: FC<Props> = props => {
  const { item, status } = props;
  const { product, productBatchList, fullState } = item;

  const maxCount = useMemo(
    () =>
      fullState
        ? fullState.salesCount +
          fullState.inStoreCount -
          productBatchList.reduce((prev, cur) => prev + cur.count, 0)
        : 0,
    [],
  );

  const min = Math.min(...productBatchList.map(item => item.count));
  const h = 100;

  const productBatches = useMemo(() => {
    let salesCount = fullState.salesCount;
    return productBatchList.map(item => {
      const beforeH = (salesCount * 100) / item.count;
      const sales = beforeH > 0 ? Math.min(salesCount, item.count) : 0;
      salesCount = Math.max(salesCount - item.count, 0);
      return {
        ...item,
        height: (item.count / min) * h,
        beforeH,
        sales,
        inStore: item.count - sales,
      };
    });
  }, [productBatchList, fullState]);

  return (
    <Item {...item}>
      <ColumnHeader status={status} product={product} />
      <Stack spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
        {product.sku}
        <br />
        всего: {fullState.salesCount + fullState.inStoreCount}
        <br />
        продано: {fullState.salesCount}
        <br />
        на складе: {fullState.inStoreCount}
        {productBatches.map(item => (
          <BatchItem sx={{ height: 200, p: 1 }} $beforeH={item.beforeH}>
            <Box sx={{ position: 'relative' }}>
              <strong>{item.name}</strong>
              <br />
              Всего: {item.count}
              <br />
              Продано: {item.sales}
              <br />
              Остаток: {item.inStore}
              <br />
              {/*C/c единицы: {(item.costPricePerUnit / 100).toFixed(2)}*/}
              {/*<br />*/}
              {/*C/c партии: {(item.fullPrice / 100).toFixed(2)}*/}
            </Box>
          </BatchItem>
        ))}
      </Stack>
    </Item>
  );
};

export default Column;
