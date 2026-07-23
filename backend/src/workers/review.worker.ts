import { Worker, type Job } from 'bullmq';
import { environment, logger } from '../config';
import {
  getRedisConnection,
  JOB_NAMES,
  REVIEW_QUEUE_NAME,
  type ReviewPullRequestJobPayload,
} from '../queue';
import {
  createPullRequestReview,
  generateReview,
  getPullRequest,
  getPullRequestFiles,
  mapReviewResultToGitHubPayload,
  persistReview,
  submitPullRequestReview,
} from '../services';
import { repositoryRepository } from '../repositories';
import type { AiSettings } from '../services/repository.service';
import type { ChangedFile, NormalizedPullRequest, PullRequestInfo } from '../types';
import { detectLanguage } from '../utils';

let workerInstance: Worker | null = null;

/**
 * Checks if a file is reviewable.
 * Skips empty patches, configuration, locks, build artifacts, images, videos, and binaries.
 */
const isReviewableFile = (filename: string, patch?: string): boolean => {
  if (!patch) {
    return false;
  }

  const normalizedPath = filename.toLowerCase().replace(/\\/g, '/');

  // Ignored directories
  const ignoredDirs = ['node_modules/', 'dist/', 'build/', 'coverage/'];
  if (
    ignoredDirs.some((dir) => normalizedPath.startsWith(dir) || normalizedPath.includes('/' + dir))
  ) {
    return false;
  }

  // Ignored specific files
  const ignoredFiles = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'];
  const baseName = normalizedPath.split('/').pop() || '';
  if (ignoredFiles.includes(baseName)) {
    return false;
  }

  // Ignored extensions (binary, images, videos, etc.)
  const ignoredExtensions = [
    // Images
    'png',
    'jpg',
    'jpeg',
    'gif',
    'webp',
    'svg',
    'ico',
    'bmp',
    'tiff',
    // Videos / Audio
    'mp4',
    'webm',
    'avi',
    'mov',
    'mkv',
    'mp3',
    'wav',
    'flac',
    // Archives
    'zip',
    'gz',
    'tar',
    'rar',
    '7z',
    // Fonts
    'woff',
    'woff2',
    'ttf',
    'eot',
    // Executables
    'exe',
    'dll',
    'so',
    'dylib',
    'bin',
    // Maps
    'map',
  ];

  const extension = baseName.split('.').pop() || '';
  if (ignoredExtensions.includes(extension)) {
    return false;
  }

  return true;
};

/**
 * Starts the review queue worker.
 * Consumes `review.pull_request` jobs and logs their metadata.
 */
export const startReviewWorker = (): Worker => {
  if (workerInstance) {
    return workerInstance;
  }

  workerInstance = new Worker(
    REVIEW_QUEUE_NAME,
    async (job: Job<ReviewPullRequestJobPayload>) => {
      if (job.name !== JOB_NAMES.REVIEW_PULL_REQUEST) {
        logger.warn('Unknown job name received by worker', {
          jobId: job.id,
          jobName: job.name,
        });
        return;
      }

      const {
        repositoryFullName,
        pullRequestNumber,
        action,
        repositoryId: githubRepositoryId,
      } = job.data;

      // Log: Job received, including repository, PR number, action
      logger.info('Job received', {
        jobId: job.id,
        repository: repositoryFullName,
        pullRequestNumber,
        action,
        githubRepositoryId,
      });

      const [owner, repo] = repositoryFullName.split('/');
      if (!owner || !repo) {
        logger.error('Invalid repository full name', { repositoryFullName });
        await Promise.resolve(job.discard());
        throw new Error(`Invalid repository full name: ${repositoryFullName}`);
      }

      // Load AI settings before doing any work
      const repoDoc = await repositoryRepository.findByGithubRepositoryId(githubRepositoryId);
      const aiSettings: AiSettings = repoDoc?.aiSettings ?? {
        enabled: true,
        reviewLevel: 'standard',
        maxFiles: 50,
        maxPatchCharacters: 3000,
        includeSecurity: true,
        includePerformance: true,
        includeMaintainability: true,
        includeBestPractices: true,
        ignoredPaths: [],
        model: 'meta/llama-3.1-8b-instruct',
      };

      if (!aiSettings.enabled) {
        logger.info('Repository review disabled, skipping AI review', {
          repository: repositoryFullName,
          pullRequestNumber,
          githubRepositoryId,
        });
        return { success: true, data: { skipped: true, reason: 'review_disabled' } };
      }

      logger.info('AI settings loaded', {
        repository: repositoryFullName,
        pullRequestNumber,
        reviewLevel: aiSettings.reviewLevel,
        model: aiSettings.model,
        includeSecurity: aiSettings.includeSecurity,
        includePerformance: aiSettings.includePerformance,
        includeMaintainability: aiSettings.includeMaintainability,
        includeBestPractices: aiSettings.includeBestPractices,
        maxFiles: aiSettings.maxFiles,
        maxPatchCharacters: aiSettings.maxPatchCharacters,
      });

      const githubToken = environment.GITHUB_TOKEN;

      let prData;
      try {
        prData = await getPullRequest(owner, repo, pullRequestNumber, githubToken);
        logger.info('PR fetched', { repositoryFullName, pullRequestNumber });
      } catch (error: unknown) {
        const err = error as Record<string, unknown>;
        const status = typeof err.status === 'number' ? err.status : undefined;
        const statusCode = typeof err.statusCode === 'number' ? err.statusCode : undefined;
        const message = typeof err.message === 'string' ? err.message : String(error);

        if (statusCode === 404 || status === 404) {
          logger.error('Pull request not found, failing job', {
            repository: repositoryFullName,
            pullRequestNumber,
            error: message,
          });
          await Promise.resolve(job.discard());
          throw new Error(`Pull Request not found: ${repositoryFullName}#${pullRequestNumber}`);
        }
        throw error;
      }

      const filesData = await getPullRequestFiles(owner, repo, pullRequestNumber, githubToken);
      logger.info('Files fetched', {
        repositoryFullName,
        pullRequestNumber,
        count: filesData.length,
      });

      // Filter and normalize files
      const filteredFiles = filesData.filter((file) => isReviewableFile(file.filename, file.patch));
      logger.info('Files filtered', {
        repositoryFullName,
        pullRequestNumber,
        originalCount: filesData.length,
        filteredCount: filteredFiles.length,
      });

      const normalizedFiles: ChangedFile[] = filteredFiles.map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch,
        language: detectLanguage(file.filename),
      }));

      logger.info('Normalization completed', { repositoryFullName, pullRequestNumber });

      const pullRequestInfo: PullRequestInfo = {
        id: prData.id,
        number: prData.number,
        title: prData.title,
        state: prData.state,
        htmlUrl: prData.html_url,
        owner,
        repo,
        branch: prData.head.ref,
        sha: prData.head.sha,
      };

      const normalizedPullRequest: NormalizedPullRequest = {
        pullRequest: pullRequestInfo,
        files: normalizedFiles,
      };

      // Summary logging
      const totalFiles = normalizedFiles.length;
      const totalAdditions = normalizedFiles.reduce((acc, file) => acc + file.additions, 0);
      const totalDeletions = normalizedFiles.reduce((acc, file) => acc + file.deletions, 0);
      const totalLinesChanged = totalAdditions + totalDeletions;

      logger.info('Pull Request Summary', {
        repository: repositoryFullName,
        pullRequestNumber,
        numberOfFiles: totalFiles,
        linesChanged: totalLinesChanged,
      });

      // AI Code Review
      logger.info('Generating AI code review...', { repositoryFullName, pullRequestNumber });

      const reviewResult = await generateReview(normalizedPullRequest);

      logger.info('AI code review completed', {
        repositoryFullName,
        pullRequestNumber,
        overallScore: reviewResult.overallScore,
        findingsCount: reviewResult.findings.length,
      });

      // Map Review Result to GitHub Payload
      logger.info('Review publishing started', { repositoryFullName, pullRequestNumber });

      const { payload, skippedFindings } = mapReviewResultToGitHubPayload(reviewResult);

      logger.info('Comments prepared', {
        repositoryFullName,
        pullRequestNumber,
        preparedCount: payload.comments.length,
      });

      if (skippedFindings.length > 0) {
        logger.warn('Comments skipped', {
          repositoryFullName,
          pullRequestNumber,
          skippedCount: skippedFindings.length,
          skippedFindings,
        });
      }

      // Publish Review to GitHub
      const { reviewId, createdComments, skippedComments } = await createPullRequestReview(
        owner,
        repo,
        pullRequestNumber,
        pullRequestInfo.sha,
        payload.body,
        payload.comments,
        githubToken,
      );

      const reviewUrl = await submitPullRequestReview(
        owner,
        repo,
        pullRequestNumber,
        reviewId,
        githubToken,
      );

      logger.info('Review submitted', {
        repositoryFullName,
        pullRequestNumber,
        reviewId,
        reviewUrl,
        commentsCreated: createdComments,
        commentsSkippedByApi: skippedComments,
      });

      // Save to Database
      try {
        const repoDoc = await repositoryRepository.findByGithubRepositoryId(githubRepositoryId);
        if (repoDoc) {
          const reviewDoc = await persistReview({
            ownerId: repoDoc.owner,
            repositoryId: repoDoc._id,
            githubRepositoryId,
            pullRequestNumber,
            commitSha: pullRequestInfo.sha,
            branch: pullRequestInfo.branch,
            status: 'published',
            reviewResult,
            normalizedPullRequest,
          });
          logger.info('Review saved', {
            reviewId: reviewDoc._id.toString(),
            repository: repositoryFullName,
            pullRequestNumber,
          });
        } else {
          logger.warn('Review save failed: Repository not found in database', {
            repository: repositoryFullName,
            githubRepositoryId,
            pullRequestNumber,
          });
        }
      } catch (error) {
        logger.error('Review save failed', {
          repository: repositoryFullName,
          pullRequestNumber,
          error: error instanceof Error ? error.message : String(error),
        });
        // Do NOT fail the GitHub review job since publishing succeeded.
      }

      return {
        success: true,
        data: {
          normalizedPullRequest,
          reviewResult,
          reviewUrl,
        },
      };
    },
    {
      connection: getRedisConnection(),
    },
  );

  workerInstance.on('completed', (job) => {
    logger.info('Job completed', {
      jobId: job.id,
      jobName: job.name,
    });
  });

  workerInstance.on('failed', (job, error) => {
    logger.error('Job failed', {
      jobId: job?.id,
      jobName: job?.name,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  logger.info('Worker started');

  return workerInstance;
};
