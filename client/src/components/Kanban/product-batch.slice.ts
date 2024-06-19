import 'immer';

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import update from 'immutability-helper';

import {
  CreateProductBatchInput,
  ProductBatchInStatusFragment,
  UpdateProductBatchInput,
} from '@/gql-types/graphql';
import { type RootState } from '@/redux-store';

import {
  createProductBatch,
  deleteProductBatch,
  fetchProductBatchList,
  updateProductBatch,
} from './product-batch.api';

export interface ProductBatchStateItem extends ProductBatchInStatusFragment {
  checked: boolean;
}

export interface ProductBatchState {
  items: ProductBatchStateItem[];
}

const initialState: ProductBatchState = {
  items: [],
};

const buildProductBatchItemState = (
  data: ProductBatchInStatusFragment[],
): ProductBatchStateItem[] => data.map(item => ({ ...item, checked: false }));

export const loadProductBatchListAsync = createAsyncThunk(
  'productBatch/load',
  async () => {
    return await fetchProductBatchList();
  },
);
export const updateProductBatchAsync = createAsyncThunk(
  'productBatch/update',
  async (input: UpdateProductBatchInput) => {
    return await updateProductBatch(input);
  },
);
export const createProductBatchAsync = createAsyncThunk(
  'productBatch/create',
  async (input: CreateProductBatchInput) => {
    return await createProductBatch(input);
  },
);

export const deleteProductBatchAsync = createAsyncThunk(
  'productBatch/delete',
  async (id: number) => {
    return await deleteProductBatch(id);
  },
);

export const productBatchSlice = createSlice({
  name: 'productBatch',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    toggleCheck: (state, action: PayloadAction<number>) => {
      const item = state.items.find(item => item.id === action.payload);
      if (!item) throw new Error('not found id');

      const index = state.items.indexOf(item);
      item.checked = !item.checked;
      state.items = update(state.items, {
        [index]: { $set: item },
      });
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: builder => {
    builder
      .addCase(loadProductBatchListAsync.fulfilled, (state, action) => {
        state.items = buildProductBatchItemState([...action.payload]);
      })
      .addCase(updateProductBatchAsync.fulfilled, (state, action) => {
        if (!action.payload) throw new Error('not found action.payload');
        state.items = buildProductBatchItemState([...action.payload]);
      })
      .addCase(createProductBatchAsync.fulfilled, (state, action) => {
        if (!action.payload) throw new Error('error 1');

        const parentId = action.meta.arg.parentId;
        if (parentId) {
          const index = state.items.findIndex(item => item.id === parentId);
          if (index == -1) throw new Error('error 1');
          state.items.splice(index, 1);
        }

        state.items.push(...buildProductBatchItemState([...action.payload]));
      })

      .addCase(deleteProductBatchAsync.fulfilled, (state, action) => {
        if (!action.payload) throw new Error('error 1');
        const item = state.items.find(item => item.id === action.payload);
        if (!item) throw new Error('error 1');
        const index = state.items.indexOf(item);
        state.items.splice(index, 1);
      });
  },
});

export const { toggleCheck } = productBatchSlice.actions;

export const selectProductBatchList = (state: RootState) =>
  state.productBatch.items;
export const selectCheckedProductBatchList = (state: RootState) =>
  state.productBatch.items.filter(item => item.checked);

export default productBatchSlice.reducer;
