import type { CookieOptions, Request, Response } from 'express';

import { environment } from '../../config';
import { COOKIE_NAMES } from '../../constants';

const TOKEN_DURATION_PATTERN = /^(?<value>\d+)(?<unit>ms|s|m|h|d)$/;

const DURATION_MULTIPLIERS = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

const getBaseCookieOptions = (): CookieOptions => {
  return {
    httpOnly: true,
    secure: environment.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
};

const getCookieMaxAge = (expiresIn: string): number | undefined => {
  const match = TOKEN_DURATION_PATTERN.exec(expiresIn);

  if (!match?.groups) {
    return undefined;
  }

  const value = Number(match.groups.value);
  const unit = match.groups.unit as keyof typeof DURATION_MULTIPLIERS;

  return value * DURATION_MULTIPLIERS[unit];
};

export const setAccessCookie = (response: Response, token: string): void => {
  response.cookie(COOKIE_NAMES.ACCESS_TOKEN, token, {
    ...getBaseCookieOptions(),
    maxAge: getCookieMaxAge(environment.JWT_ACCESS_EXPIRES_IN),
  });
};

export const setRefreshCookie = (response: Response, token: string): void => {
  response.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, {
    ...getBaseCookieOptions(),
    maxAge: getCookieMaxAge(environment.JWT_REFRESH_EXPIRES_IN),
  });
};

export const setGithubAccessTokenCookie = (response: Response, token: string): void => {
  response.cookie(COOKIE_NAMES.GITHUB_ACCESS_TOKEN, token, {
    ...getBaseCookieOptions(),
    maxAge: getCookieMaxAge(environment.JWT_REFRESH_EXPIRES_IN),
  });
};

export const clearCookies = (response: Response): void => {
  response.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, getBaseCookieOptions());
  response.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, getBaseCookieOptions());
  response.clearCookie(COOKIE_NAMES.GITHUB_ACCESS_TOKEN, getBaseCookieOptions());
};

const getCookieValue = (request: Request, cookieName: string): string | undefined => {
  const cookies: unknown = request.cookies;

  if (!cookies || typeof cookies !== 'object') {
    return undefined;
  }

  const cookieRecord = cookies as Partial<Record<string, unknown>>;
  const value = cookieRecord[cookieName];

  return typeof value === 'string' ? value : undefined;
};

export const getAccessToken = (request: Request): string | undefined => {
  return getCookieValue(request, COOKIE_NAMES.ACCESS_TOKEN);
};

export const getRefreshToken = (request: Request): string | undefined => {
  return getCookieValue(request, COOKIE_NAMES.REFRESH_TOKEN);
};

export const getGithubAccessToken = (request: Request): string | undefined => {
  return getCookieValue(request, COOKIE_NAMES.GITHUB_ACCESS_TOKEN);
};
