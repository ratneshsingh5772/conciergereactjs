import api from '../../services/api';
import type { DailyTrend, MonthlySpend, AnalyticsSummary, Forecast } from './types';

export const fetchDailyTrend = async (userId: string, days: number = 10): Promise<DailyTrend[]> => {
  const response = await api.get<DailyTrend[]>(`/users/${userId}/analytics/trend?days=${days}`);
  return response.data;
};

export const fetchMonthlySpend = async (userId: string, year?: number): Promise<MonthlySpend[]> => {
  const currentYear = year || new Date().getFullYear();
  const response = await api.get<MonthlySpend[]>(`/users/${userId}/analytics/monthly-spend?year=${currentYear}`);
  return response.data;
};

export const fetchAnalyticsSummary = async (userId: string): Promise<AnalyticsSummary> => {
  const response = await api.get<AnalyticsSummary>(`/users/${userId}/analytics/summary`);
  return response.data;
};

export const fetchForecast = async (userId: string): Promise<Forecast> => {
  const response = await api.get<Forecast>(`/users/${userId}/analytics/forecast`);
  return response.data;
};
