import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import { Status } from '../../gql-types/graphql';
import { type AppThunk, type RootState } from '../../redux-store';
import { createStatus, deleteStatus, fetchStatusList } from './status-list.api';

export interface StatusListState {
  items: Status[];
}

const initialState: StatusListState = {
  items: [],
};

export const loadStatusListAsync = createAsyncThunk(
  'statusList/load',
  async (): Promise<Status[]> => await fetchStatusList(),
);
// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const createStatusAsync = createAsyncThunk(
  'statusList/create',
  createStatus,
);
export const deleteStatusAsync = createAsyncThunk(
  'statusList/delete',
  deleteStatus,
);

export const statusListSlice = createSlice({
  name: 'status',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    increment: state => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      // state.value += 1;
    },
    decrement: state => {
      // state.value -= 1;
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    incrementByAmount: (state, action: PayloadAction<number>) => {
      // state.value += action.payload;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: builder => {
    builder
      .addCase(createStatusAsync.pending, state => {
        // state.status = 'loading';
      })
      .addCase(createStatusAsync.fulfilled, (state, action) => {
        // state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(createStatusAsync.rejected, state => {
        // state.status = 'loading';
      })
      .addCase(loadStatusListAsync.pending, state => {
        // state.status = 'loading';
      })
      .addCase(loadStatusListAsync.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(loadStatusListAsync.rejected, state => {
        // state.status = 'loading';
      })
      .addCase(deleteStatusAsync.pending, state => {
        // state.status = 'loading';
      })
      .addCase(deleteStatusAsync.fulfilled, (state, action) => {
        // state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(deleteStatusAsync.rejected, state => {
        // state.status = 'loading';
      });
  },
});

export const { increment, decrement, incrementByAmount } =
  statusListSlice.actions;

export const selectStatusList = (state: RootState) => state.statusList.items;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
export const incrementIfOdd =
  (amount: number): AppThunk =>
  (dispatch, getState) => {
    // const currentValue = selectCount(getState());
    // if (currentValue % 2 === 1) {
    // dispatch(incrementByAmount(amount));
    // }
  };

export default statusListSlice.reducer;
