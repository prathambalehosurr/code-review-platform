import { apiClient } from './api';
import type { ApiSuccess, Paginated } from '../types/api';
import type { Repository, AiSettings } from '../types/repository';
import type { Review } from '../types/review';

export const repositoryService = {
  list: async (): Promise<Repository[]> => {
    const res = await apiClient.get<ApiSuccess<Repository[]>>('/repositories');
    return res.data.data;
  },

  get: async (id: string): Promise<Repository> => {
    const res = await apiClient.get<ApiSuccess<Repository>>(`/repositories/${id}`);
    return res.data.data;
  },

  sync: async (): Promise<Repository[]> => {
    const res = await apiClient.post<ApiSuccess<Repository[]>>('/repositories/sync');
    return res.data.data;
  },

  connect: async (id: string): Promise<Repository> => {
    const res = await apiClient.patch<ApiSuccess<Repository>>(`/repositories/${id}/connect`);
    return res.data.data;
  },

  disconnect: async (id: string): Promise<Repository> => {
    const res = await apiClient.patch<ApiSuccess<Repository>>(`/repositories/${id}/disconnect`);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/repositories/${id}`);
  },

  getSettings: async (id: string): Promise<AiSettings> => {
    const res = await apiClient.get<ApiSuccess<AiSettings>>(`/repositories/${id}/settings`);
    return res.data.data;
  },

  updateSettings: async (id: string, settings: Partial<AiSettings>): Promise<AiSettings> => {
    const res = await apiClient.patch<ApiSuccess<AiSettings>>(`/repositories/${id}/settings`, settings);
    return res.data.data;
  },

  getReviews: async (
    id: string,
    params?: { page?: number; limit?: number; sort?: string }
  ): Promise<Paginated<Review>> => {
    const res = await apiClient.get<ApiSuccess<Paginated<Review>>>(`/repositories/${id}/reviews`, { params });
    return res.data.data;
  },
};
