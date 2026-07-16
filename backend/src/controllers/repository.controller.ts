import type { Request, Response } from 'express';

import { AuthenticationError, ValidationError } from '../errors';
import { getGithubAccessToken } from '../services';
import {
  connectRepository,
  createRepository,
  deleteRepository,
  disconnectRepository,
  getRepository,
  getRepositorySettings,
  listRepositories,
  syncRepositories,
  updateRepositorySettings,
} from '../services/repository.service';
import { created, success } from '../utils';
import type { CreateRepositoryInput } from '../validators';

const getAuthenticatedUserId = (request: Request): string => {
  if (!request.user) {
    throw new AuthenticationError('Authenticated user is required');
  }

  return request.user.id;
};

const getRepositoryId = (request: Request): string => {
  const { id } = request.params;

  if (typeof id !== 'string') {
    throw new ValidationError('Repository id is required');
  }

  return id;
};

export const listRepositoryController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const repositories = await listRepositories(getAuthenticatedUserId(request));

  success(response, undefined, repositories);
};

export const getRepositoryController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const repository = await getRepository(getAuthenticatedUserId(request), getRepositoryId(request));

  success(response, undefined, repository);
};

export const createRepositoryController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const repository = await createRepository(
    getAuthenticatedUserId(request),
    request.body as CreateRepositoryInput,
  );

  created(response, 'Repository created successfully', repository);
};

export const connectRepositoryController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const repository = await connectRepository(
    getAuthenticatedUserId(request),
    getRepositoryId(request),
  );

  success(response, 'Repository connected successfully', repository);
};

export const disconnectRepositoryController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const repository = await disconnectRepository(
    getAuthenticatedUserId(request),
    getRepositoryId(request),
  );

  success(response, 'Repository disconnected successfully', repository);
};

export const deleteRepositoryController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await deleteRepository(getAuthenticatedUserId(request), getRepositoryId(request));

  success(response, 'Repository deleted successfully');
};

export const syncRepositoriesController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const githubAccessToken = getGithubAccessToken(request);

  if (!githubAccessToken) {
    throw new AuthenticationError('GitHub access token cookie is missing');
  }

  const repositories = await syncRepositories(getAuthenticatedUserId(request), githubAccessToken);

  success(response, undefined, repositories);
};

export const getRepositorySettingsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const settings = await getRepositorySettings(
    getAuthenticatedUserId(request),
    getRepositoryId(request),
  );

  success(response, undefined, settings);
};

export const updateRepositorySettingsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const settings = await updateRepositorySettings(
    getAuthenticatedUserId(request),
    getRepositoryId(request),
    request.body as Record<string, unknown>,
  );

  success(response, 'Settings updated successfully', settings);
};
