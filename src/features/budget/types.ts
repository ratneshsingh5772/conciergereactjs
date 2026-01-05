export type BudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Budget {
  id: number;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  budgetAmount: number;
  currentSpending: number;
  remaining: number;
  percentageUsed: number;
  budgetPeriod: BudgetPeriod;
  alertThreshold: number;
  isTotalBudget: boolean;
  isOverBudget: boolean;
  isNearLimit: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetRequest {
  categoryName?: string;
  budgetAmount: number;
  budgetPeriod: BudgetPeriod;
  alertThreshold?: number;
  isTotalBudget?: boolean;
}

export interface UpdateBudgetRequest {
  budgetAmount: number;
  budgetPeriod: BudgetPeriod;
  alertThreshold?: number;
}

export interface BudgetResponse {
  success: boolean;
  data: Budget;
  message: string;
}

export interface BudgetListResponse {
  success: boolean;
  data: Budget[];
  message: string;
}

export interface CategoryListResponse {
  success: boolean;
  data: Category[];
  message: string;
  timestamp: string;
}
