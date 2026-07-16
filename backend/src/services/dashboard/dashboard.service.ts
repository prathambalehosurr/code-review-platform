import { logger } from '../../config';
import { DEFAULT_PAGINATION } from '../../constants';
import { NotFoundError } from '../../errors';
import type { Review } from '../../models';
import { repositoryRepository } from '../../repositories';
import {
  reviewRepository,
  type ReviewPage,
  type ReviewSortField,
} from '../../repositories/review.repository';

// ---------------------------------------------------------------------------
// Serialisation
// ---------------------------------------------------------------------------

export type ReviewResponse = {
  id: string;
  repository: string;
  owner: string;
  githubRepositoryId: number;
  pullRequestNumber: number;
  commitSha: string;
  branch: string;
  status: string;
  summary?: string;
  overallScore?: number;
  findings: Review['findings'];
  positives: string[];
  statistics: Review['statistics'];
  createdAt: string;
  updatedAt: string;
};

const toReviewResponse = (review: Review): ReviewResponse => ({
  id: review._id.toString(),
  repository: review.repository.toString(),
  owner: review.owner.toString(),
  githubRepositoryId: review.githubRepositoryId,
  pullRequestNumber: review.pullRequestNumber,
  commitSha: review.commitSha,
  branch: review.branch,
  status: review.status,
  summary: review.summary ?? undefined,
  overallScore: review.overallScore ?? undefined,
  findings: review.findings,
  positives: review.positives,
  statistics: review.statistics,
  createdAt: review.createdAt.toISOString(),
  updatedAt: review.updatedAt.toISOString(),
});

export type PaginatedReviews = {
  items: ReviewResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export type DashboardData = {
  totalRepositories: number;
  connectedRepositories: number;
  totalReviews: number;
  averageScore: number;
  reviewsLast30Days: number;
};

export const getDashboardData = async (ownerId: string): Promise<DashboardData> => {
  logger.info('Dashboard requested', { ownerId });

  const [repositories, totalReviews, averageScore, reviewsLast30Days] = await Promise.all([
    repositoryRepository.findByOwner(ownerId),
    reviewRepository.findByOwner(ownerId).then((r) => r.length),
    reviewRepository.averageScore(ownerId),
    reviewRepository.countSince(
      ownerId,
      (() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d;
      })(),
    ),
  ]);

  return {
    totalRepositories: repositories.length,
    connectedRepositories: repositories.filter((r) => r.isConnected).length,
    totalReviews,
    averageScore: Math.round(averageScore * 10) / 10,
    reviewsLast30Days,
  };
};

// ---------------------------------------------------------------------------
// Reviews list (paginated)
// ---------------------------------------------------------------------------

export type ListReviewsInput = {
  page?: number;
  limit?: number;
  repository?: string;
  sort?: ReviewSortField;
};

export const listReviews = async (
  ownerId: string,
  input: ListReviewsInput,
): Promise<PaginatedReviews> => {
  const page = Math.max(1, input.page ?? DEFAULT_PAGINATION.PAGE);
  const limit = Math.min(
    Math.max(1, input.limit ?? DEFAULT_PAGINATION.LIMIT),
    DEFAULT_PAGINATION.MAX_LIMIT,
  );
  const sort: ReviewSortField = input.sort ?? 'newest';

  const filter: Record<string, unknown> = { owner: ownerId };
  if (input.repository) {
    filter.repository = input.repository;
  }

  logger.info('Reviews requested', { ownerId, page, limit, sort, repository: input.repository });

  const page_result: ReviewPage = await reviewRepository.findPaginated(filter, page, limit, sort);

  return {
    items: page_result.items.map(toReviewResponse),
    total: page_result.total,
    page: page_result.page,
    limit: page_result.limit,
    totalPages: page_result.totalPages,
  };
};

// ---------------------------------------------------------------------------
// Single review
// ---------------------------------------------------------------------------

export const getReview = async (ownerId: string, reviewId: string): Promise<ReviewResponse> => {
  const review = await reviewRepository.findById(reviewId);

  if (!review || review.owner.toString() !== ownerId) {
    throw new NotFoundError('Review not found');
  }

  return toReviewResponse(review);
};

// ---------------------------------------------------------------------------
// Reviews by repository (paginated)
// ---------------------------------------------------------------------------

export type ListRepositoryReviewsInput = {
  page?: number;
  limit?: number;
};

export const listRepositoryReviews = async (
  ownerId: string,
  repositoryId: string,
  input: ListRepositoryReviewsInput,
): Promise<PaginatedReviews> => {
  // Enforce ownership — throws NotFoundError if user doesn't own it
  const repo = await repositoryRepository.findById(repositoryId);
  if (!repo || repo.owner.toString() !== ownerId) {
    throw new NotFoundError('Repository not found');
  }

  const page = Math.max(1, input.page ?? DEFAULT_PAGINATION.PAGE);
  const limit = Math.min(
    Math.max(1, input.limit ?? DEFAULT_PAGINATION.LIMIT),
    DEFAULT_PAGINATION.MAX_LIMIT,
  );

  const page_result: ReviewPage = await reviewRepository.findPaginated(
    { repository: repositoryId, owner: ownerId },
    page,
    limit,
    'newest',
  );

  return {
    items: page_result.items.map(toReviewResponse),
    total: page_result.total,
    page: page_result.page,
    limit: page_result.limit,
    totalPages: page_result.totalPages,
  };
};

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

export type StatisticsData = {
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  averageScore: number;
  reviewTrend: Array<{ date: string; count: number }>;
  repositoriesReviewed: number;
};

export const getStatistics = async (ownerId: string): Promise<StatisticsData> => {
  logger.info('Statistics requested', { ownerId });

  const [severityCounts, averageScore, reviewTrend, repositoriesReviewed] = await Promise.all([
    reviewRepository.aggregateSeverityCounts(ownerId),
    reviewRepository.averageScore(ownerId),
    reviewRepository.reviewTrend(ownerId, 30),
    reviewRepository.distinctRepositoriesReviewed(ownerId),
  ]);

  return {
    severityCounts,
    averageScore: Math.round(averageScore * 10) / 10,
    reviewTrend,
    repositoriesReviewed,
  };
};
