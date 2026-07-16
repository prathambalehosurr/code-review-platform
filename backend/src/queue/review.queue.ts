import { Queue } from 'bullmq';
import { getRedisConnection } from './connection';

export const REVIEW_QUEUE_NAME = 'review';

export const JOB_NAMES = {
  REVIEW_PULL_REQUEST: 'review.pull_request',
} as const;

export interface ReviewPullRequestJobPayload {
  repositoryId: number;
  repositoryFullName: string;
  pullRequestNumber: number;
  installationId: number | null;
  action: string;
  sender: string;
  timestamp: string;
}

/**
 * Reusable review queue instance.
 * Configured with attempts = 3 and exponential backoff of 2000ms.
 */
export const reviewQueue = new Queue(REVIEW_QUEUE_NAME, {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});
