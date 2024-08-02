import {
  createContext,
  FC,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FullStateDtoFragment } from 'remoteOzon/full-state.api';

import { ProductBatch } from '../api/product-batch/product-batch.gql';
import { ProductBatchGroup } from '../api/product-batch-group/product-batch-group.gql';
import { StatusFragment } from '../gql-types/graphql';

export const StoreStateContext = createContext<FullStateDtoFragment[]>([]);

export type Props = {
  status: StatusFragment;
  items: (ProductBatch | ProductBatchGroup)[];
  skip: boolean;
  children: ReactElement;
};

export const StoreStateProvider: FC<Props> = props => {
  const { children, status, items = [], skip = false } = props;

  const [fullState, setFullState] = useState<FullStateDtoFragment[]>([]);

  const mapItems = useMemo(() => {
    const map = new Map<number, { id: number; count: number }[]>();
    items.forEach(item => {
      switch (item.__typename) {
        case 'ProductBatchDto': {
          const mapItem = map.get(item.productId) ?? [];
          mapItem.push({ id: item.id, count: item.count });
          map.set(item.productId, mapItem);
          break;
        }
        case 'ProductBatchGroupDto': {
          item.productBatchList.forEach(item => {
            const mapItem = map.get(item.productId) ?? [];
            mapItem.push({ id: item.id, count: item.count });
            map.set(item.productId, mapItem);
          });
          break;
        }
        default:
          throw new Error('unknown __typename');
      }
    });
    return [...map.entries()].map(([baseProductId, productBatches]) => ({
      baseProductId,
      productBatches,
    }));
  }, [items]);

  const prevMapItems = useRef(JSON.stringify(mapItems));

  useEffect(() => {
    if (
      !skip &&
      status.storeId &&
      prevMapItems.current != JSON.stringify(mapItems)
    ) {
      import('remoteOzon/full-state.api').then(({ fetchFullState }) => {
        fetchFullState({
          storeId: 1114008,
          items: mapItems.map(({ baseProductId, productBatches }) => ({
            baseProductId,
            fromProductBatchId: productBatches[0].id,
          })),
        }).then(data => {
          setFullState(data);
        });
        prevMapItems.current = JSON.stringify(mapItems);
      });
    }
  }, [items]);

  // useEffect(() => {
  //   fullState.forEach(item => {
  //     const maxCount = fullState
  //       ? item.unlinkedSalesCount +
  //         item.inStoreCount -
  //         productBatchList.reduce((prev, cur) => prev + cur.count, 0)
  //       : 0;
  //
  //     const min = Math.min(...productBatchList.map(item => item.count));
  //     const h = 100;
  //
  //     let salesCount = fullState.salesCount;
  //     return productBatchList.map(item => {
  //       const beforeH = (salesCount * 100) / item.count;
  //       const sales = beforeH > 0 ? Math.min(salesCount, item.count) : 0;
  //       salesCount = Math.max(salesCount - item.count, 0);
  //       return {
  //         ...item,
  //         height: (item.count / min) * h,
  //         beforeH,
  //         sales,
  //         inStore: item.count - sales,
  //       };
  //     });
  //   });
  // }, [fullState]);

  return (
    <StoreStateContext.Provider value={fullState}>
      {children}
    </StoreStateContext.Provider>
  );
};

export const useStoreState = (productBatch: ProductBatch) => {
  const fullState = useContext(StoreStateContext);
  const aa = fullState
    .find(item => item.baseProductId == productBatch.productId)
    ?.linkedSales.find(item => item.productBatchId == productBatch.id);
  console.log(aa);
  return {};
};
