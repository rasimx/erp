import {
  type Action,
  configureStore,
  type ThunkAction,
} from '@reduxjs/toolkit';

const reduxStore = configureStore({
  reducer: {},
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
