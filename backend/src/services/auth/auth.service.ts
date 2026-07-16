import { logger } from '../../config';
import { AUTH_PROVIDER } from '../../constants';
import { AuthenticationError, AuthorizationError } from '../../errors';
import type { User } from '../../models';
import { userRepository } from '../../repositories';
import type { AuthenticatedUser, GithubProfile, JwtPayload } from '../../types';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './jwt.service';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type GithubLoginResult = {
  user: User;
  isNewUser: boolean;
};

const toAuthenticatedUser = (user: User): AuthenticatedUser => {
  return {
    id: user._id.toString(),
    githubId: user.githubId ?? undefined,
    email: user.email,
    username: user.username,
    provider: user.provider,
    avatarUrl: user.avatarUrl ?? undefined,
    name: user.name ?? undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

const getActiveUserById = async (userId: string): Promise<User> => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AuthenticationError('Authenticated user was not found');
  }

  if (!user.isActive) {
    throw new AuthorizationError('User account is inactive');
  }

  return user;
};

export const loginOrRegisterGithubUser = async (
  profile: GithubProfile,
): Promise<GithubLoginResult> => {
  const existingUser = await userRepository.findByGithubId(profile.githubId);

  if (existingUser) {
    const updatedUser = await userRepository.update(existingUser._id.toString(), {
      username: profile.username,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      name: profile.name,
      lastLoginAt: new Date(),
    });

    if (!updatedUser) {
      throw new AuthenticationError('Unable to update GitHub user');
    }

    logger.info('GitHub user logged in', {
      userId: updatedUser._id.toString(),
      githubId: profile.githubId,
    });

    return {
      user: updatedUser,
      isNewUser: false,
    };
  }

  const newUser = await userRepository.create({
    githubId: profile.githubId,
    username: profile.username,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
    name: profile.name,
    provider: AUTH_PROVIDER.GITHUB,
    isActive: true,
    lastLoginAt: new Date(),
  });

  logger.info('New GitHub user registered', {
    userId: newUser._id.toString(),
    githubId: profile.githubId,
  });

  return {
    user: newUser,
    isNewUser: true,
  };
};

export const generateAuthTokens = (user: AuthenticatedUser): AuthTokens => {
  const tokenPayload: Omit<JwtPayload, 'tokenType'> = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };

  return {
    accessToken: generateAccessToken(tokenPayload),
    refreshToken: generateRefreshToken(tokenPayload),
  };
};

export const authenticateGithubUser = async (
  profile: GithubProfile,
): Promise<AuthenticatedUser> => {
  const { user } = await loginOrRegisterGithubUser(profile);

  return toAuthenticatedUser(user);
};

export const getCurrentUser = async (accessToken: string): Promise<AuthenticatedUser> => {
  const payload = verifyAccessToken(accessToken);
  const user = await getActiveUserById(payload.userId);

  return toAuthenticatedUser(user);
};

export const refreshAuthentication = async (refreshToken: string): Promise<AuthTokens> => {
  const payload = verifyRefreshToken(refreshToken);
  const user = await getActiveUserById(payload.userId);

  logger.info('Authentication refreshed', {
    userId: user._id.toString(),
  });

  return generateAuthTokens(toAuthenticatedUser(user));
};

export const logout = (user?: AuthenticatedUser): void => {
  logger.info('User logged out', {
    userId: user?.id,
  });
};
