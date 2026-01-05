import api from '../../services/api';
import type { DashboardResponse, CategoryBreakdown, DailySpending, BudgetStatus, Expense } from './types';

export const getDashboardStats = async (): Promise<DashboardResponse> => {
  const response = await api.get<DashboardResponse>('/expenses/dashboard');
  return response.data;
};

export const getCategoryBreakdown = async (): Promise<{ success: boolean; data: CategoryBreakdown[] }> => {
  const response = await api.get<{ success: boolean; data: CategoryBreakdown[] }>('/expenses/breakdown/category');
  return response.data;
};

export const getDailySpendingTrends = async (): Promise<{ success: boolean; data: DailySpending[] }> => {
  const response = await api.get<{ success: boolean; data: DailySpending[] }>('/expenses/trends/daily');
  return response.data;
};

export const getBudgetStatus = async (): Promise<{ success: boolean; data: BudgetStatus[] }> => {
  const response = await api.get<{ success: boolean; data: BudgetStatus[] }>('/expenses/budget/status');
  return response.data;
};

export const getCurrentMonthExpenses = async (): Promise<{ success: boolean; data: Expense[]; message: string }> => {
  const response = await api.get<{ success: boolean; data: Expense[]; message: string }>('/expenses/current-month');
  return response.data;
};

export const getDashboardByDateRange = async (startDate: string, endDate: string): Promise<DashboardResponse> => {
  const response = await api.get<DashboardResponse>(`/expenses/dashboard/range?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};
