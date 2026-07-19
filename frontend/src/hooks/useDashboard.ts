import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export const useDashboard = (enabled = true) => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboard,
    enabled,
    staleTime: 60_000,
  });
};

export const useStatistics = (enabled = true) => {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: dashboardService.getStatistics,
    enabled,
    staleTime: 60_000,
  });
};
