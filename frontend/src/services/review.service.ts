import { apiClient } from './api';
import type { ApiSuccess, Paginated } from '../types/api';
import type { Review } from '../types/review';

export type ReviewsParams = {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'highestScore' | 'lowestScore';
  repository?: string;
};

export const reviewService = {
  list: async (params?: ReviewsParams): Promise<Paginated<Review>> => {
    const res = await apiClient.get<ApiSuccess<Paginated<Review>>>('/reviews', { params });
    return res.data.data;
  },

  get: async (id: string): Promise<Review> => {
    const res = await apiClient.get<ApiSuccess<Review>>(`/reviews/${id}`);
    return res.data.data;
  },
};
