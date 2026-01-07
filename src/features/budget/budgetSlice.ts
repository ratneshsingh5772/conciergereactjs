import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type { Budget, CreateBudgetRequest, UpdateBudgetRequest, BudgetPeriod, Category } from './types';
import * as budgetAPI from './budgetAPI';

interface BudgetState {
  budgets: Budget[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  currentPeriod: BudgetPeriod;
}

const initialState: BudgetState = {
  budgets: [],
  categories: [],
  loading: false,
  error: null,
  currentPeriod: 'MONTHLY',
};

export const fetchCategories = createAsyncThunk(
  'budget/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await budgetAPI.getCategories();
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchBudgets = createAsyncThunk(
  'budget/fetchBudgets',
  async (period: BudgetPeriod, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { user: { id: string } } };
      const userId = state.auth.user?.id;
      if (!userId) throw new Error("User ID not found");

      const response = await budgetAPI.getBudgets(userId, period);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budgets');
    }
  }
);

export const createCategoryBudget = createAsyncThunk(
  'budget/createCategory',
  async (data: CreateBudgetRequest, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { user: { id: string } } };
      const userId = state.auth.user?.id;
      if (!userId) throw new Error("User ID not found");

      const response = await budgetAPI.createCategoryBudget(userId, data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Failed to create budget');
    }
  }
);

export const createTotalBudget = createAsyncThunk(
  'budget/createTotal',
  async (data: CreateBudgetRequest, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { user: { id: string } } };
      const userId = state.auth.user?.id;
      if (!userId) throw new Error("User ID not found");

      const response = await budgetAPI.createTotalBudget(userId, data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Failed to create total budget');
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budget/update',
  async ({ id, data }: { id: number; data: UpdateBudgetRequest }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { user: { id: string } } };
      const userId = state.auth.user?.id;
      if (!userId) throw new Error("User ID not found");
      
      const response = await budgetAPI.updateBudget(userId, id, data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Failed to update budget');
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budget/delete',
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { user: { id: string } } };
      const userId = state.auth.user?.id;
      if (!userId) throw new Error("User ID not found");

      await budgetAPI.deleteBudget(userId, id);
      return id;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Failed to delete budget');
    }
  }
);

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setPeriod: (state, action: PayloadAction<BudgetPeriod>) => {
      state.currentPeriod = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Fetch Budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Category Budget
      .addCase(createCategoryBudget.fulfilled, (state, action) => {
        // If a budget for this category already exists (updated via create), replace it
        const index = state.budgets.findIndex(b => b.categoryName === action.payload.categoryName && !b.isTotalBudget);
        if (index === -1) {
          state.budgets.push(action.payload);
        } else {
          state.budgets[index] = action.payload;
        }
      })
      // Create Total Budget
      .addCase(createTotalBudget.fulfilled, (state, action) => {
        const index = state.budgets.findIndex(b => b.isTotalBudget);
        if (index === -1) {
          state.budgets.push(action.payload);
        } else {
          state.budgets[index] = action.payload;
        }
      })
      // Update Budget
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.budgets.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      // Delete Budget
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter(b => b.id !== action.payload);
      });
  },
});

export const { setPeriod, clearError } = budgetSlice.actions;
export default budgetSlice.reducer;
