import type { Request, Response } from 'express';

import { AuthenticationError } from '../errors';
import {
  getDashboardData,
  getReview,
  getStatistics,
  listRepositoryReviews,
  listReviews,
} from '../services/dashboard';
import { success } from '../utils';

const getAuthenticatedUserId = (request: Request): string => {
  if (!request.user) {
    throw new AuthenticationError('Authenticated user is required');
  }
  return request.user.id;
};

export const getDashboardController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const data = await getDashboardData(getAuthenticatedUserId(request));
  success(response, undefined, data);
};

export const listReviewsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { page, limit, repository, sort } = request.query;

  const reviews = await listReviews(getAuthenticatedUserId(request), {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    repository: typeof repository === 'string' ? repository : undefined,
    sort: sort as 'newest' | 'oldest' | 'highestScore' | 'lowestScore' | undefined,
  });

  success(response, undefined, reviews);
};

export const getReviewController = async (request: Request, response: Response): Promise<void> => {
  const id = request.params.id as string;
  const review = await getReview(getAuthenticatedUserId(request), id);
  success(response, undefined, review);
};

export const listRepositoryReviewsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const id = request.params.id as string;
  const { page, limit } = request.query;

  const reviews = await listRepositoryReviews(getAuthenticatedUserId(request), id, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  success(response, undefined, reviews);
};

export const getStatisticsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const data = await getStatistics(getAuthenticatedUserId(request));
  success(response, undefined, data);
};
