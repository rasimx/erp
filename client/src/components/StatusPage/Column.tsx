import styled from '@emotion/styled';
import { Card, Stack } from '@mui/material';
import React, { type FC } from 'react';

import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { ProductFragment, StatusFragment } from '../../gql-types/graphql';
import { ProductBatchCard } from '../ProductBatchPage/ProductBatchCard';
import ColumnHeader from './ColumnHeader';

export type A = {
  product: ProductFragment;
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

  return (
    <Item {...item}>
      <ColumnHeader status={status} product={product} />
      <Stack spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
        {productBatchList.map(item => (
          <ProductBatchCard card={item} refetch={() => {}} />
        ))}
      </Stack>
    </Item>
  );
};

export default Column;
