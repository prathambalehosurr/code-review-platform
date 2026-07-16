import { logger } from '../config';
import { JOB_NAMES, reviewQueue } from '../queue';
import type {
  NormalizedPingEvent,
  NormalizedPullRequestEvent,
  NormalizedWebhookEvent,
} from '../types';

// ---------------------------------------------------------------------------
// Raw GitHub payload shapes (only the fields we actually read)
// ---------------------------------------------------------------------------

type RawPullRequestPayload = {
  action: string;
  number: number;
  repository: {
    id: number;
    full_name: string;
  };
  installation?: {
    id: number;
  };
  sender: {
    login: string;
  };
  pull_request: {
    created_at: string;
  };
};

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

const normalizePullRequest = (payload: RawPullRequestPayload): NormalizedPullRequestEvent => {
  return {
    event: 'pull_request',
    action: payload.action,
    repositoryId: payload.repository.id,
    repositoryFullName: payload.repository.full_name,
    pullRequestNumber: payload.number,
    installationId: payload.installation?.id ?? null,
    sender: payload.sender.login,
    timestamp: payload.pull_request.created_at,
  };
};

const normalizePing = (): NormalizedPingEvent => {
  return { event: 'ping' };
};

// ---------------------------------------------------------------------------
// Public service function
// ---------------------------------------------------------------------------

/**
 * Normalizes a raw GitHub webhook payload and enqueues a background job if supported.
 *
 * Supported events: `pull_request`, `ping`.
 * All other events are silently ignored and return `null`.
 *
 * @param eventType - The value of the `X-GitHub-Event` header.
 * @param rawPayload - The parsed JSON body from GitHub.
 * @returns A normalized event or `null` when the event type is not supported.
 */
export const processWebhookEvent = async (
  eventType: string,
  rawPayload: unknown,
): Promise<NormalizedWebhookEvent | null> => {
  if (eventType === 'ping') {
    logger.info('Webhook event received', { event: 'ping' });
    return normalizePing();
  }

  if (eventType === 'pull_request') {
    const payload = rawPayload as RawPullRequestPayload;

    const normalized = normalizePullRequest(payload);

    logger.info('Webhook event received', {
      event: 'pull_request',
      action: normalized.action,
      repository: normalized.repositoryFullName,
      pullRequestNumber: normalized.pullRequestNumber,
    });

    // Enqueue job to reviewQueue
    const job = await reviewQueue.add(JOB_NAMES.REVIEW_PULL_REQUEST, {
      repositoryId: normalized.repositoryId,
      repositoryFullName: normalized.repositoryFullName,
      pullRequestNumber: normalized.pullRequestNumber,
      installationId: normalized.installationId,
      action: normalized.action,
      sender: normalized.sender,
      timestamp: normalized.timestamp,
    });

    logger.info('Job queued', { jobId: job.id, jobName: job.name });

    return normalized;
  }

  logger.info('Unsupported webhook event received', { event: eventType });

  return null;
};
