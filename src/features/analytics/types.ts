export interface DailyTrend {
  date: string;
  day: string;
  amount: number;
}

export interface MonthlySpend {
  month: string;
  amount: number;
}

export interface HighestDailySpend {
  date: string;
  amount: number;
}

export interface AnalyticsSummary {
  totalSpentLast10Days: number;
  projectedMonthlySpend: number;
  highestDailySpend: HighestDailySpend;
}

export interface PredictedExpense {
  category: string;
  estimatedAmount: number;
  confidence: string;
}

export interface Forecast {
  predictedYearEndSpend: number;
  predictedMonthEndSpend: number;
  nextLikelySpend: PredictedExpense;
  aiAnalysis: string;
}
