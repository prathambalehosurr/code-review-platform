import { apiClient } from './api';
import type { ApiSuccess } from '../types/api';
import type { DashboardData, StatisticsData } from '../types/dashboard';

export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    const res = await apiClient.get<ApiSuccess<DashboardData>>('/dashboard');
    return res.data.data;
  },

  getStatistics: async (): Promise<StatisticsData> => {
    const res = await apiClient.get<ApiSuccess<StatisticsData>>('/statistics');
    return res.data.data;
  },
};
