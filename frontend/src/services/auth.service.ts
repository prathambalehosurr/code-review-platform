import { apiClient } from './api';
import type { ApiSuccess } from '../types/api';
import type { User } from '../types/user';

export const authService = {
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<ApiSuccess<User>>('/auth/me');
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refresh: async (): Promise<void> => {
    await apiClient.post('/auth/refresh');
  },

  getGithubLoginUrl: (): string => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    return `${base}/auth/github`;
  },
};
