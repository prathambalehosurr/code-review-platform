import mongoose from 'mongoose';
import { Review, type IReview } from '../../src/models/review.model';

export const ReviewFactory = {
  create: async (
    repositoryId: mongoose.Types.ObjectId,
    ownerId: mongoose.Types.ObjectId,
    overrides: Partial<IReview> = {},
  ): Promise<IReview> => {
    const review = new Review({
      repository: repositoryId,
      owner: ownerId,
      githubRepositoryId: Math.floor(Math.random() * 1000000),
      pullRequestNumber: Math.floor(Math.random() * 100) + 1,
      commitSha: 'abcdef1234567890',
      branch: 'feature-branch',
      status: 'completed',
      summary: 'LGTM',
      overallScore: 85,
      findings: [],
      positives: ['Clean code'],
      statistics: {
        filesReviewed: 1,
        additions: 10,
        deletions: 2,
        findingsCount: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
      ...overrides,
    });
    return review.save();
  },
};
