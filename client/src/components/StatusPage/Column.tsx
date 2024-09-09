import styled from '@emotion/styled';
import { Card, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import React, { type FC } from 'react';

import { Product } from '../../api/product/product.gql';
import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { StatusFragment } from '../../gql-types/graphql';
import { ProductBatchCard } from '../ProductBatchPage/ProductBatchCard';
import { useStoreStateByProductId } from '../StoreState';
import ColumnHeader from './ColumnHeader';

export type A = {
  product: Product;
  productBatchList: ProductBatch[];
};

const Item = styled(Card)<A>`
  padding: 10px;
  flex-shrink: 0;
  width: 280px;
  position: relative;
`;

interface Props {
  item: A;
  status: StatusFragment;
}

const Column: FC<Props> = props => {
  const { item, status } = props;
  const { product, productBatchList } = item;
  const storeState = useStoreStateByProductId(product.id);

  const listItems: { label: string; value: string | number }[] = [];
  if (storeState) {
    const linkedCount = storeState.linkedSales.reduce(
      (prev, cur) => prev + cur.count,
      0,
    );
    listItems.push(
      ...[
        {
          label: 'Всего',
          value:
            storeState.inStoreCount +
            storeState.unlinkedSalesCount +
            linkedCount,
        },
        {
          label: 'На складе FBO',
          value: storeState.inStoreCount,
        },
        {
          label: 'Учтенных',
          value: linkedCount,
        },
        {
          label: 'Не учтенных',
          value: storeState.unlinkedSalesCount,
        },
      ],
    );
  }

  return (
    <Item {...item}>
      <ColumnHeader status={status} product={product} />
      <Card sx={{ fontSize: 12, mb: 2, mt: 2, p: 2 }}>
        {listItems.map((item, index) => (
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between' }}
            key={index}
          >
            <Box>{item.label}</Box>
            <Box>{item.value}</Box>
          </Box>
        ))}
      </Card>
      <Stack spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
        {productBatchList.map(item => (
          <ProductBatchCard card={item} refetch={() => {}} />
        ))}
      </Stack>
    </Item>
  );
};

export default Column;
