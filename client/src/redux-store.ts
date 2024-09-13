import {
  type Action,
  configureStore,
  type ThunkAction,
} from '@reduxjs/toolkit';

import productBatchPageReducer from './components/ProductBatchPage/product-batch-page.slice';

const reduxStore = configureStore({
  reducer: {
    productBatchPage: productBatchPageReducer,
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
