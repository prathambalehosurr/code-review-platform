import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { AuthenticateOptions } from 'passport';

import { environment, logger } from '../config';
import { passport } from '../config/passport';
import { AuthenticationError } from '../errors';
import {
  clearCookies,
  getRefreshToken,
  setAccessCookie,
  setGithubAccessTokenCookie,
  setRefreshCookie,
} from '../services';
import { generateAuthTokens, logout, refreshAuthentication } from '../services/auth/auth.service';
import type { AuthenticatedUser } from '../types';
import { success } from '../utils';

const GITHUB_AUTH_FAILURE_URL = `${environment.CLIENT_URL}/login?error=github_auth_failed`;
const GITHUB_AUTH_SUCCESS_URL = `${environment.CLIENT_URL}/dashboard`;

type PassportAuthenticate = (
  strategy: string,
  options: AuthenticateOptions,
  callback?: (error: unknown, user: Express.User | false | null | undefined) => void,
) => RequestHandler;

const typedPassport = passport as unknown as {
  authenticate: PassportAuthenticate;
};

const isAuthenticatedUser = (
  user: Express.User | false | null | undefined,
): user is AuthenticatedUser => {
  return Boolean(user) && typeof user !== 'boolean';
};

export const startGithubAuth: RequestHandler = typedPassport.authenticate('github', {
  scope: ['user:email'],
  session: false,
});

export const handleGithubCallback = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  typedPassport.authenticate(
    'github',
    { session: false },
    (error: unknown, user: Express.User | false | null | undefined) => {
      if (error || !isAuthenticatedUser(user)) {
        logger.warn('GitHub OAuth callback failed', {
          requestId: request.requestId,
          error: error instanceof Error ? error.message : 'GitHub user was not authenticated',
        });

        response.redirect(GITHUB_AUTH_FAILURE_URL);
        return;
      }

      const tokens = generateAuthTokens(user);
      setAccessCookie(response, tokens.accessToken);
      setRefreshCookie(response, tokens.refreshToken);

      if (user.githubAccessToken) {
        setGithubAccessTokenCookie(response, user.githubAccessToken);
      }

      logger.info('GitHub OAuth login completed', {
        requestId: request.requestId,
        userId: user.id,
      });

      response.redirect(GITHUB_AUTH_SUCCESS_URL);
    },
  )(request, response, next);
};

export const getMe = (request: Request, response: Response): void => {
  success(response, undefined, request.user);
};

export const refreshAuth = async (request: Request, response: Response): Promise<void> => {
  const refreshToken = getRefreshToken(request);

  if (!refreshToken) {
    logger.warn('Refresh token cookie missing', {
      requestId: request.requestId,
    });

    throw new AuthenticationError('Refresh token cookie is missing');
  }

  try {
    const tokens = await refreshAuthentication(refreshToken);
    setAccessCookie(response, tokens.accessToken);
    setRefreshCookie(response, tokens.refreshToken);
  } catch (error) {
    logger.warn('Refresh authentication failed', {
      requestId: request.requestId,
      error: error instanceof Error ? error.message : 'Unknown refresh authentication error',
    });

    throw error;
  }

  success(response);
};

export const logoutUser = (request: Request, response: Response): void => {
  logout(request.user);
  clearCookies(response);

  success(response, 'Logged out successfully');
};
