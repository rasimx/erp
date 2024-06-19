import {
  type Action,
  configureStore,
  type ThunkAction,
} from '@reduxjs/toolkit';

import kanbanReducer from './components/Kanban/product-batch.slice';
import statusListReducer from './components/Kanban/status-list.slice';

const reduxStore = configureStore({
  reducer: {
    productBatch: kanbanReducer,
    statusList: statusListReducer,
  },
});

// export const persistor = persistStore(store);

export type RootState = ReturnType<typeof reduxStore.getState>;
export type AppDispatch = typeof reduxStore.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default reduxStore;
