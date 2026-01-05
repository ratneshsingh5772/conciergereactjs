export interface CategoryBreakdown {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface DailySpending {
  date: string;
  amount: number;
  transactionCount: number;
}

export interface Expense {
  id: number;
  amount: number;
  currency?: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  description: string;
  expenseDate: string;
  aiParsed?: boolean;
  originalMessage?: string;
  createdAt?: string;
}

export interface BudgetStatus {
  categoryName: string;
  categoryIcon: string;
  budgetLimit: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

export interface DashboardData {
  totalSpentThisMonth: number;
  totalSpentLastMonth: number;
  monthOverMonthChange: number;
  transactionCount: number;
  categoryBreakdown: CategoryBreakdown[];
  dailySpending: DailySpending[];
  topExpenses: Expense[];
  budgetStatus: BudgetStatus[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message: string;
}
