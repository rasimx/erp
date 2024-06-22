import {
  type Action,
  configureStore,
  type ThunkAction,
} from '@reduxjs/toolkit';

import kanbanReducer from './api/product-batch/product-batch.slice';
import statusReducer from './api/status/status.slice';

const reduxStore = configureStore({
  reducer: {
    productBatch: kanbanReducer,
    status: statusReducer,
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
