import {
  type Action,
  configureStore,
  type ThunkAction,
} from '@reduxjs/toolkit';

import kanbanReducer from './components/Kanban/product-batch.slice';
import statusListReducer from './components/Kanban/status-list.slice';

const store = configureStore({
  reducer: {
    productBatch: kanbanReducer,
    statusList: statusListReducer,
  },
});

// export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;
