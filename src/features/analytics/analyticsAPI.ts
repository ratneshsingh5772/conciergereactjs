import api from '../../services/api';
import type { DailyTrend, MonthlySpend, AnalyticsSummary, Forecast } from './types';

export const fetchDailyTrend = async (days: number = 10): Promise<DailyTrend[]> => {
  const response = await api.get<DailyTrend[]>(`/analytics/daily-trend?days=${days}`);
  return response.data;
};

export const fetchMonthlySpend = async (year?: number): Promise<MonthlySpend[]> => {
  const currentYear = year || new Date().getFullYear();
  const response = await api.get<MonthlySpend[]>(`/analytics/monthly-spend?year=${currentYear}`);
  return response.data;
};

export const fetchAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const response = await api.get<AnalyticsSummary>('/analytics/summary');
  return response.data;
};

export const fetchForecast = async (): Promise<Forecast> => {
  const response = await api.get<Forecast>('/analytics/forecast');
  return response.data;
};
