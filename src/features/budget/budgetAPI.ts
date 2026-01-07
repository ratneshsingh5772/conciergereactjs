import api from '../../services/api';
import type { CreateBudgetRequest, UpdateBudgetRequest, BudgetResponse, BudgetListResponse, BudgetPeriod, CategoryListResponse } from './types';

// Categories are generally global/system-wide, so keeping them as global endpoint is fine, 
// unless your app has user-custom categories. If so, this should change to /users/:id/categories too.
// Assuming categories are shared system metadata for now based on typical patterns.
export const getCategories = async (): Promise<CategoryListResponse> => {
  const response = await api.get<CategoryListResponse>('/categories');
  return response.data;
};

export const getBudgets = async (userId: string, period: BudgetPeriod = 'MONTHLY'): Promise<BudgetListResponse> => {
  const response = await api.get<BudgetListResponse>(`/users/${userId}/budgets?period=${period}`);
  return response.data;
};

export const createCategoryBudget = async (userId: string, data: CreateBudgetRequest): Promise<BudgetResponse> => {
  const response = await api.post<BudgetResponse>(`/users/${userId}/budgets/category`, data);
  return response.data;
};

export const createTotalBudget = async (userId: string, data: CreateBudgetRequest): Promise<BudgetResponse> => {
  const response = await api.post<BudgetResponse>(`/users/${userId}/budgets/total`, data);
  return response.data;
};

export const updateBudget = async (userId: string, id: number, data: UpdateBudgetRequest): Promise<BudgetResponse> => {
  const response = await api.put<BudgetResponse>(`/users/${userId}/budgets/${id}`, data);
  return response.data;
};

export const deleteBudget = async (userId: string, id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/users/${userId}/budgets/${id}`);
  return response.data;
};
