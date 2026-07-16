import { logger } from '../../config';
import type { Review } from '../../models';
import { reviewRepository } from '../../repositories';
import type { NormalizedPullRequest } from '../../types';
import type { ReviewResult } from '../../validators';
import type { Types } from 'mongoose';

export interface PersistReviewParams {
  ownerId: string | Types.ObjectId;
  repositoryId: string | Types.ObjectId;
  githubRepositoryId: number;
  pullRequestNumber: number;
  commitSha: string;
  branch: string;
  status: 'pending' | 'completed' | 'failed' | 'published';
  reviewResult?: ReviewResult;
  normalizedPullRequest?: NormalizedPullRequest;
}

/**
 * Computes statistics for the review from the PR diff and AI findings.
 */
const computeStatistics = (
  normalizedPullRequest?: NormalizedPullRequest,
  reviewResult?: ReviewResult,
) => {
  let filesReviewed = 0;
  let additions = 0;
  let deletions = 0;

  if (normalizedPullRequest) {
    filesReviewed = normalizedPullRequest.files.length;
    additions = normalizedPullRequest.files.reduce((sum, file) => sum + file.additions, 0);
    deletions = normalizedPullRequest.files.reduce((sum, file) => sum + file.deletions, 0);
  }

  let findingsCount = 0;
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;
  let info = 0;

  if (reviewResult) {
    findingsCount = reviewResult.findings.length;
    for (const finding of reviewResult.findings) {
      switch (finding.severity) {
        case 'critical':
          critical++;
          break;
        case 'high':
          high++;
          break;
        case 'medium':
          medium++;
          break;
        case 'low':
          low++;
          break;
        case 'info':
          info++;
          break;
      }
    }
  }

  return {
    filesReviewed,
    additions,
    deletions,
    findingsCount,
    critical,
    high,
    medium,
    low,
    info,
  };
};

/**
 * Persists a review to the database.
 */
export const persistReview = async (params: PersistReviewParams): Promise<Review> => {
  const statistics = computeStatistics(params.normalizedPullRequest, params.reviewResult);

  const review = await reviewRepository.create({
    owner: params.ownerId,
    repository: params.repositoryId,
    githubRepositoryId: params.githubRepositoryId,
    pullRequestNumber: params.pullRequestNumber,
    commitSha: params.commitSha,
    branch: params.branch,
    status: params.status,
    summary: params.reviewResult?.summary,
    overallScore: params.reviewResult?.overallScore,
    findings: params.reviewResult?.findings || [],
    positives: params.reviewResult?.positives || [],
    statistics,
  });

  logger.info('Review saved', {
    reviewId: review._id.toString(),
    repository: params.repositoryId.toString(),
    pullRequestNumber: params.pullRequestNumber,
  });

  return review;
};
