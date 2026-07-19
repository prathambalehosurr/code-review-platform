import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../services/review.service';
import type { ReviewsParams } from '../services/review.service';

export const useReviews = (params?: ReviewsParams) => {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => reviewService.list(params),
    staleTime: 30_000,
  });
};

export const useReview = (id: string) => {
  return useQuery({
    queryKey: ['review', id],
    queryFn: () => reviewService.get(id),
    enabled: !!id,
  });
};
