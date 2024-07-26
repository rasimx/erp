import {
  createContext,
  FC,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import { StatusFragment } from '../gql-types/graphql';
import { KanbanBoardProps } from './KanbanBoard/types';

export const StoreStateContext = createContext(
  {} as KanbanBoardProps<Column, Group, Card>,
);

export type Props = {
  status: StatusFragment;
  children: ReactElement;
};

export const StoreStateProvider: FC<Props> = ({ children, status }) => {
  1;

  useEffect(() => {
    if (status?.storeId) {
      import('remoteOzon/full-state.api').then(({ fetchFullState }) => {
        fetchFullState({ storeId: 1114008 }).then(data => {
          setFullState(data);
        });
      });
    }
  }, [status]);

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
    <StoreStateContext.Provider value={}>{children}</StoreStateContext.Provider>
  );
};

export const useStoreState = (productBatchId: number) => {
  const context = useContext(StoreStateContext);
};
