import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useKanban } from '../../api/kanban/kanban.hook';
import { useProductList } from '../../api/product/product.hooks';
import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { useStatus } from '../../api/status/status.hooks';
import { StoreStateProvider } from '../StoreState';
import Column, { A } from './Column';

export const StatusPage: FC = () => {
  const params = useParams();
  const statusId = Number(params.statusId);

  const status = useStatus(Number(statusId));
  const statusIds = useMemo(() => [statusId], [statusId]);

  const dto = useMemo(
    () => ({
      statusIds: [statusId],
    }),
    [statusId],
  );
  const { kanbanCards } = useKanban(dto);
  console.log(statusIds);

  const productBatchList = useMemo(
    () =>
      kanbanCards.flatMap(item => {
        if (item.__typename == 'ProductBatchGroupDto')
          return item.productBatchList;
        return [item as ProductBatch];
      }),
    [kanbanCards],
  );

  const productIds = useMemo(() => {
    return [
      ...new Set<number>([
        ...productBatchList.map(item => item.product).map(({ id }) => id),
      ]),
    ];
  }, [productBatchList]);

  const { items } = useProductList(productIds);

  const columns = useMemo(() => {
    const map = new Map<number, A>(
      items.map(product => [
        product.id,
        { product, productBatchList: [], fullState: null },
      ]),
    );
    productBatchList.forEach(item => {
      map.get(item.productId)?.productBatchList.push(item);
    });

    return [...map.values()];
  }, [items, productBatchList]);
  console.log(columns);

  return (
    status &&
    productBatchList && (
      <StoreStateProvider status={status} items={productBatchList}>
        <Box sx={{ height: '90vh' }}>
          <Stack
            spacing={1}
            sx={{ p: 1, width: '100%', overflow: 'auto', height: '100%' }}
            direction="row"
          >
            {columns?.map(item => <Column item={item} status={status} />)}
          </Stack>
        </Box>
      </StoreStateProvider>
    )
  );
};
