import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type { Category, CreateCategoryRequest } from './types';
import * as categoriesAPI from './categoriesAPI';

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
  operationLoading: boolean; // For create/update/delete operations
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
  operationLoading: false,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoriesAPI.getCategories();
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (data: CreateCategoryRequest, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { user: { id: string } } };
      const userId = state.auth.user?.id;
      if (!userId) throw new Error("User ID not found");

      const response = await categoriesAPI.createCategory(userId, data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }: { id: number; data: CreateCategoryRequest }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { user: { id: string } } };
      const userId = state.auth.user?.id;
      if (!userId) throw new Error("User ID not found");

      const response = await categoriesAPI.updateCategory(userId, id, data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { user: { id: string } } };
      const userId = state.auth.user?.id;
      if (!userId) throw new Error("User ID not found");

      await categoriesAPI.deleteCategory(userId, id);
      return id;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createCategory.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.items.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateCategory.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteCategory.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.items = state.items.filter(c => c.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
