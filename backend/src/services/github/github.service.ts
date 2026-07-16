import { Octokit, type RestEndpointMethodTypes } from '@octokit/rest';
import { RequestError } from '@octokit/request-error';

import { logger } from '../../config';
import { ERROR_CODES, HTTP_STATUS } from '../../constants';
import { AppError, AuthenticationError } from '../../errors';

export type GitHubRepository =
  RestEndpointMethodTypes['repos']['listForAuthenticatedUser']['response']['data'][number];

export type GitHubAuthenticatedUser =
  RestEndpointMethodTypes['users']['getAuthenticated']['response']['data'];

export const createClient = (accessToken?: string): Octokit => {
  return new Octokit(accessToken ? { auth: accessToken } : {});
};

const mapGitHubError = (error: unknown): AppError => {
  if (error instanceof RequestError) {
    logger.error('GitHub API request failed', {
      status: error.status,
      message: error.message,
    });

    if (error.status === HTTP_STATUS.UNAUTHORIZED) {
      return new AuthenticationError('GitHub authorization failed');
    }

    if (error.status === HTTP_STATUS.FORBIDDEN) {
      return new AppError(
        'GitHub rate limit exceeded',
        HTTP_STATUS.TOO_MANY_REQUESTS,
        [],
        ERROR_CODES.GITHUB_RATE_LIMIT,
      );
    }

    if (error.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      return new AppError(
        'GitHub is currently unavailable',
        HTTP_STATUS.BAD_GATEWAY,
        [],
        ERROR_CODES.GITHUB_API_ERROR,
      );
    }

    return new AppError(
      'GitHub API request failed',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      [],
      ERROR_CODES.GITHUB_API_ERROR,
    );
  }

  logger.error('Unexpected GitHub API failure', {
    error: error instanceof Error ? error.message : 'Unknown GitHub API error',
  });

  return new AppError(
    'Unexpected GitHub API failure',
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    [],
    ERROR_CODES.GITHUB_API_ERROR,
  );
};

export const getAuthenticatedUser = async (
  accessToken: string,
): Promise<GitHubAuthenticatedUser> => {
  try {
    const client = createClient(accessToken);
    const response = await client.users.getAuthenticated();

    return response.data;
  } catch (error) {
    throw mapGitHubError(error);
  }
};

export const getRepositories = async (accessToken: string): Promise<GitHubRepository[]> => {
  try {
    const client = createClient(accessToken);

    return await client.paginate(client.repos.listForAuthenticatedUser, {
      affiliation: 'owner,collaborator,organization_member',
      direction: 'desc',
      per_page: 100,
      sort: 'updated',
    });
  } catch (error) {
    throw mapGitHubError(error);
  }
};

export const getPullRequest = async (
  owner: string,
  repo: string,
  pullNumber: number,
  accessToken?: string,
): Promise<RestEndpointMethodTypes['pulls']['get']['response']['data']> => {
  try {
    const client = createClient(accessToken);
    const response = await client.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });
    return response.data;
  } catch (error) {
    throw mapGitHubError(error);
  }
};

export const getPullRequestFiles = async (
  owner: string,
  repo: string,
  pullNumber: number,
  accessToken?: string,
): Promise<RestEndpointMethodTypes['pulls']['listFiles']['response']['data']> => {
  try {
    const client = createClient(accessToken);
    return await client.paginate(client.pulls.listFiles, {
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 100,
    });
  } catch (error) {
    throw mapGitHubError(error);
  }
};

/**
 * Creates a Pull Request review with inline comments.
 * It first creates a pending review with the summary body.
 * Then it attempts to create each inline comment independently to ensure one failure doesn't block the rest.
 */
export const createPullRequestReview = async (
  owner: string,
  repo: string,
  pullNumber: number,
  commitId: string,
  body: string,
  comments: { path: string; line: number; body: string }[],
  accessToken?: string,
): Promise<{ reviewId: number; createdComments: number; skippedComments: number }> => {
  const client = createClient(accessToken);
  let reviewId: number;

  try {
    const response = await client.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      commit_id: commitId,
      body,
    });
    reviewId = response.data.id;
  } catch (error) {
    throw mapGitHubError(error);
  }

  let createdComments = 0;
  let skippedComments = 0;

  for (const comment of comments) {
    try {
      await client.pulls.createReviewComment({
        owner,
        repo,
        pull_number: pullNumber,
        commit_id: commitId,
        path: comment.path,
        line: comment.line,
        body: comment.body,
      });
      createdComments++;
    } catch (error) {
      skippedComments++;
      logger.warn('Failed to create inline comment, skipping', {
        owner,
        repo,
        pullNumber,
        path: comment.path,
        line: comment.line,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { reviewId, createdComments, skippedComments };
};

/**
 * Submits a pending pull request review.
 */
export const submitPullRequestReview = async (
  owner: string,
  repo: string,
  pullNumber: number,
  reviewId: number,
  accessToken?: string,
): Promise<string> => {
  try {
    const client = createClient(accessToken);
    const response = await client.pulls.submitReview({
      owner,
      repo,
      pull_number: pullNumber,
      review_id: reviewId,
      event: 'COMMENT',
    });
    return response.data.html_url;
  } catch (error) {
    throw mapGitHubError(error);
  }
};
