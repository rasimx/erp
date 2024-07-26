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
          <Card sx={{ height: 200, p: 1 }}>
            <Box sx={{ position: 'relative' }}>
              <strong>{item.name}</strong>
              <br />
              Всего: {item.count}
              {/*C/c единицы: {(item.costPricePerUnit / 100).toFixed(2)}*/}
              {/*<br />*/}
              {/*C/c партии: {(item.fullPrice / 100).toFixed(2)}*/}
            </Box>
          </Card>
        ))}
      </Stack>
    </Item>
  );
};

export default Column;
