import { FC, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FullStateDtoFragment } from 'remoteOzon/full-state.api';

import { useKanban } from '../../api/kanban/kanban.hook';
import { PRODUCT_FRAGMENT } from '../../api/product/product.gql';
import { useProductList } from '../../api/product/product.hooks';
import { PRODUCT_BATCH_FRAGMENT } from '../../api/product-batch/product-batch.gql';
import { useStatus } from '../../api/status/status.hooks';
import { getFragmentData } from '../../gql-types';
import { ProductBatchFragment } from '../../gql-types/graphql';
import { A } from './Column';

export const StatusPage: FC = () => {
  const params = useParams();
  const statusId = Number(params.statusId);

  const status = useStatus(Number(statusId));

  const [fullState, setFullState] = useState<FullStateDtoFragment[]>([]);

  useEffect(() => {
    if (status?.storeId) {
      import('remoteOzon/full-state.api').then(({ fetchFullState }) => {
        fetchFullState({ storeId: 1114008, items: [] }).then(data => {
          setFullState(data);
        });
      });
    }
  }, [status]);

  const { kanbanCards } = useKanban({ statusIds: [Number(statusId)] });

  const productBatchList = useMemo(
    () =>
      kanbanCards.flatMap(item => {
        if (item.__typename == 'ProductBatchGroupDto')
          return getFragmentData(PRODUCT_BATCH_FRAGMENT, item.productBatchList);
        return [item as ProductBatchFragment];
      }),
    [kanbanCards],
  );

  const productIds = useMemo(() => {
    return [
      ...new Set<number>([
        ...getFragmentData(
          PRODUCT_FRAGMENT,
          productBatchList?.map(item => item.product),
        ).map(({ id }) => id),
        ...fullState.map(({ baseProductId }) => baseProductId),
      ]),
    ];
  }, [productBatchList, fullState]);

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
    fullState.forEach(item => {
      const mapItem = map.get(item.baseProductId);
      // if (mapItem) mapItem.s = item;
    });
    return [...map.values()];
  }, [items, productBatchList]);
  console.log(columns);

  return <div>aaa</div>;
  // return (
  //   <Suspense fallback={<Preloader />}>
  //     <Box sx={{ height: '90vh' }}>
  //       <Stack
  //         spacing={1}
  //         sx={{ p: 1, width: '100%', overflow: 'auto', height: '100%' }}
  //         direction="row"
  //       >
  //         {columns?.map(
  //           item => item.fullState && <Column item={item} status={status} />,
  //         )}
  //       </Stack>
  //     </Box>
  //   </Suspense>
  // );
};
