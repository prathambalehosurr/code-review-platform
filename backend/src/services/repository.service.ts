import { logger } from '../config';
import { ConflictError, NotFoundError } from '../errors';
import type { Repository } from '../models';
import { repositoryRepository } from '../repositories';
import { getRepositories, type GitHubRepository } from './github';
import type { CreateRepositoryInput, UpdateRepositoryInput } from '../validators';

export type RepositoryResponse = {
  id: string;
  githubRepositoryId: number;
  name: string;
  fullName: string;
  defaultBranch: string;
  private: boolean;
  language?: string;
  description?: string;
  cloneUrl: string;
  htmlUrl: string;
  installationId?: number;
  isConnected: boolean;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
};

const toRepositoryResponse = (repository: Repository): RepositoryResponse => {
  return {
    id: repository._id.toString(),
    githubRepositoryId: repository.githubRepositoryId,
    name: repository.name,
    fullName: repository.fullName,
    defaultBranch: repository.defaultBranch,
    private: repository.private,
    language: repository.language ?? undefined,
    description: repository.description ?? undefined,
    cloneUrl: repository.cloneUrl,
    htmlUrl: repository.htmlUrl,
    installationId: repository.installationId ?? undefined,
    isConnected: repository.isConnected,
    lastSyncedAt: repository.lastSyncedAt?.toISOString(),
    createdAt: repository.createdAt.toISOString(),
    updatedAt: repository.updatedAt.toISOString(),
  };
};

const getOwnedRepository = async (repositoryId: string, ownerId: string): Promise<Repository> => {
  const repository = await repositoryRepository.findById(repositoryId);

  if (!repository || repository.owner.toString() !== ownerId) {
    throw new NotFoundError('Repository not found');
  }

  return repository;
};

export const createRepository = async (
  ownerId: string,
  input: CreateRepositoryInput,
): Promise<RepositoryResponse> => {
  const existingRepository = await repositoryRepository.findByGithubRepositoryId(
    input.githubRepositoryId,
  );

  if (existingRepository) {
    throw new ConflictError('Repository already exists');
  }

  const repository = await repositoryRepository.create({
    ...input,
    owner: ownerId,
    isConnected: false,
  });

  logger.info('Repository created', {
    repositoryId: repository._id.toString(),
    ownerId,
    githubRepositoryId: repository.githubRepositoryId,
  });

  return toRepositoryResponse(repository);
};

export const updateRepository = async (
  ownerId: string,
  repositoryId: string,
  input: UpdateRepositoryInput,
): Promise<RepositoryResponse> => {
  await getOwnedRepository(repositoryId, ownerId);

  const repository = await repositoryRepository.updateRepository(repositoryId, input);

  if (!repository) {
    throw new NotFoundError('Repository not found');
  }

  logger.info('Repository updated', {
    repositoryId,
    ownerId,
  });

  return toRepositoryResponse(repository);
};

export const connectRepository = async (
  ownerId: string,
  repositoryId: string,
): Promise<RepositoryResponse> => {
  await getOwnedRepository(repositoryId, ownerId);

  const repository = await repositoryRepository.updateRepository(repositoryId, {
    isConnected: true,
    lastSyncedAt: new Date(),
  });

  if (!repository) {
    throw new NotFoundError('Repository not found');
  }

  logger.info('Repository connected', {
    repositoryId,
    ownerId,
  });

  return toRepositoryResponse(repository);
};

export const disconnectRepository = async (
  ownerId: string,
  repositoryId: string,
): Promise<RepositoryResponse> => {
  await getOwnedRepository(repositoryId, ownerId);

  const repository = await repositoryRepository.updateRepository(repositoryId, {
    isConnected: false,
    lastSyncedAt: new Date(),
  });

  if (!repository) {
    throw new NotFoundError('Repository not found');
  }

  logger.info('Repository disconnected', {
    repositoryId,
    ownerId,
  });

  return toRepositoryResponse(repository);
};

export const listRepositories = async (ownerId: string): Promise<RepositoryResponse[]> => {
  const repositories = await repositoryRepository.findByOwner(ownerId);

  return repositories.map(toRepositoryResponse);
};

export const getRepository = async (
  ownerId: string,
  repositoryId: string,
): Promise<RepositoryResponse> => {
  const repository = await getOwnedRepository(repositoryId, ownerId);

  return toRepositoryResponse(repository);
};

export const deleteRepository = async (ownerId: string, repositoryId: string): Promise<void> => {
  await getOwnedRepository(repositoryId, ownerId);
  await repositoryRepository.delete(repositoryId);

  logger.info('Repository deleted', {
    repositoryId,
    ownerId,
  });
};

const toRepositorySyncInput = (repository: GitHubRepository): CreateRepositoryInput => {
  return {
    githubRepositoryId: repository.id,
    name: repository.name,
    fullName: repository.full_name,
    defaultBranch: repository.default_branch,
    private: repository.private,
    language: repository.language ?? undefined,
    description: repository.description ?? undefined,
    cloneUrl: repository.clone_url,
    htmlUrl: repository.html_url,
  };
};

export const syncRepositories = async (
  ownerId: string,
  githubAccessToken: string,
): Promise<RepositoryResponse[]> => {
  logger.info('Repository sync started', {
    ownerId,
  });

  const githubRepositories = await getRepositories(githubAccessToken);
  const syncedRepositories: RepositoryResponse[] = [];
  let added = 0;
  let updated = 0;

  for (const githubRepository of githubRepositories) {
    const syncInput = toRepositorySyncInput(githubRepository);
    const existingRepository = await repositoryRepository.findByGithubRepositoryId(
      syncInput.githubRepositoryId,
    );

    if (existingRepository) {
      if (existingRepository.owner.toString() !== ownerId) {
        throw new ConflictError('Repository already belongs to another user');
      }

      const repository = await repositoryRepository.updateByGithubRepositoryId(
        syncInput.githubRepositoryId,
        {
          ...syncInput,
          lastSyncedAt: new Date(),
        },
      );

      if (!repository) {
        throw new NotFoundError('Repository not found');
      }

      updated += 1;
      syncedRepositories.push(toRepositoryResponse(repository));
      continue;
    }

    const repository = await repositoryRepository.create({
      ...syncInput,
      owner: ownerId,
      isConnected: false,
      lastSyncedAt: new Date(),
    });

    added += 1;
    syncedRepositories.push(toRepositoryResponse(repository));
  }

  logger.info('Repository sync completed', {
    ownerId,
    total: syncedRepositories.length,
    added,
    updated,
  });

  return syncedRepositories;
};

export type AiSettings = {
  enabled: boolean;
  reviewLevel: 'light' | 'standard' | 'strict';
  maxFiles: number;
  maxPatchCharacters: number;
  includeSecurity: boolean;
  includePerformance: boolean;
  includeMaintainability: boolean;
  includeBestPractices: boolean;
  ignoredPaths: string[];
  model: 'meta/llama-3.1-8b-instruct' | 'meta/llama-3.1-70b-instruct';
};

export type UpdateAiSettingsInput = Partial<AiSettings>;

export const getRepositorySettings = async (
  ownerId: string,
  repositoryId: string,
): Promise<AiSettings> => {
  const repository = await getOwnedRepository(repositoryId, ownerId);

  return repository.aiSettings;
};

export const updateRepositorySettings = async (
  ownerId: string,
  repositoryId: string,
  input: UpdateAiSettingsInput,
): Promise<AiSettings> => {
  const repository = await getOwnedRepository(repositoryId, ownerId);
  const previous = repository.aiSettings;

  // Compute the $set update for nested aiSettings fields only
  const $set: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    $set[`aiSettings.${key}`] = value;
  }

  const updated = await repositoryRepository.updateRepository(repositoryId, { $set });

  if (!updated) {
    throw new NotFoundError('Repository not found');
  }

  const next = updated.aiSettings;

  // Targeted change-log entries
  if (input.enabled !== undefined && input.enabled !== previous.enabled) {
    logger.info(input.enabled ? 'Repository review enabled' : 'Repository review disabled', {
      repositoryId,
      ownerId,
    });
  }

  if (input.model !== undefined && input.model !== previous.model) {
    logger.info('Repository model changed', {
      repositoryId,
      ownerId,
      from: previous.model,
      to: input.model,
    });
  }

  if (input.reviewLevel !== undefined && input.reviewLevel !== previous.reviewLevel) {
    logger.info('Repository review level changed', {
      repositoryId,
      ownerId,
      from: previous.reviewLevel,
      to: input.reviewLevel,
    });
  }

  logger.info('Settings updated', {
    repositoryId,
    ownerId,
  });

  return next;
};
