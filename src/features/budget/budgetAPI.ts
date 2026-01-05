import api from '../../services/api';
import type { CreateBudgetRequest, UpdateBudgetRequest, BudgetResponse, BudgetListResponse, BudgetPeriod, CategoryListResponse } from './types';

export const getCategories = async (): Promise<CategoryListResponse> => {
  const response = await api.get<CategoryListResponse>('/categories');
  return response.data;
};

export const getBudgets = async (period: BudgetPeriod = 'MONTHLY'): Promise<BudgetListResponse> => {
  const response = await api.get<BudgetListResponse>(`/budgets?period=${period}`);
  return response.data;
};

export const createCategoryBudget = async (data: CreateBudgetRequest): Promise<BudgetResponse> => {
  const response = await api.post<BudgetResponse>('/budgets/category', data);
  return response.data;
};

export const createTotalBudget = async (data: CreateBudgetRequest): Promise<BudgetResponse> => {
  const response = await api.post<BudgetResponse>('/budgets/total', data);
  return response.data;
};

export const updateBudget = async (id: number, data: UpdateBudgetRequest): Promise<BudgetResponse> => {
  // Note: The API guide mentions PUT /api/budgets/{budgetId} but doesn't explicitly detail the payload structure for update vs create.
  // Assuming it accepts similar fields to create but for an existing ID.
  // If the backend uses POST for updates as implied in some sections ("Updates existing if duplicate"), we might need to adjust.
  // However, standard REST practice and the "Update Budget" section suggest PUT.
  const response = await api.put<BudgetResponse>(`/budgets/${id}`, data);
  return response.data;
};

export const deleteBudget = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/budgets/${id}`);
  return response.data;
};
