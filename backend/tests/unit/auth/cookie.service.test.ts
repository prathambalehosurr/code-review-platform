import { type Request, type Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { COOKIE_NAMES } from '../../../src/constants';
import {
  clearCookies,
  getAccessToken,
  getGithubAccessToken,
  getRefreshToken,
  setAccessCookie,
  setGithubAccessTokenCookie,
  setRefreshCookie,
} from '../../../src/services/auth/cookie.service';

describe('Cookie Service', () => {
  const mockResponse = () => {
    const res = {} as Response;
    res.cookie = vi.fn().mockReturnValue(res);
    res.clearCookie = vi.fn().mockReturnValue(res);
    return res;
  };

  const mockRequest = (cookies: Record<string, unknown> = {}) => {
    return { cookies } as Request;
  };

  describe('setters', () => {
    it('should set access cookie with correct options', () => {
      const res = mockResponse();
      setAccessCookie(res, 'test-access-token');

      expect(res.cookie).toHaveBeenCalledWith(
        COOKIE_NAMES.ACCESS_TOKEN,
        'test-access-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 15 * 60 * 1000, // 15m in ms
        }),
      );
    });

    it('should set refresh cookie with correct options', () => {
      const res = mockResponse();
      setRefreshCookie(res, 'test-refresh-token');

      expect(res.cookie).toHaveBeenCalledWith(
        COOKIE_NAMES.REFRESH_TOKEN,
        'test-refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7d in ms
        }),
      );
    });

    it('should set github access token cookie with correct options', () => {
      const res = mockResponse();
      setGithubAccessTokenCookie(res, 'github-token');

      expect(res.cookie).toHaveBeenCalledWith(
        COOKIE_NAMES.GITHUB_ACCESS_TOKEN,
        'github-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7d in ms
        }),
      );
    });
  });

  describe('clearCookies', () => {
    it('should clear all auth cookies', () => {
      const res = mockResponse();
      clearCookies(res);

      expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_NAMES.ACCESS_TOKEN, expect.any(Object));
      expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_NAMES.REFRESH_TOKEN, expect.any(Object));
      expect(res.clearCookie).toHaveBeenCalledWith(
        COOKIE_NAMES.GITHUB_ACCESS_TOKEN,
        expect.any(Object),
      );
    });
  });

  describe('getters', () => {
    it('should get access token if it exists', () => {
      const req = mockRequest({ [COOKIE_NAMES.ACCESS_TOKEN]: 'my-access-token' });
      expect(getAccessToken(req)).toBe('my-access-token');
    });

    it('should return undefined for access token if not present', () => {
      const req = mockRequest();
      expect(getAccessToken(req)).toBeUndefined();
    });

    it('should get refresh token if it exists', () => {
      const req = mockRequest({ [COOKIE_NAMES.REFRESH_TOKEN]: 'my-refresh-token' });
      expect(getRefreshToken(req)).toBe('my-refresh-token');
    });

    it('should get github access token if it exists', () => {
      const req = mockRequest({ [COOKIE_NAMES.GITHUB_ACCESS_TOKEN]: 'gh-token' });
      expect(getGithubAccessToken(req)).toBe('gh-token');
    });

    it('should handle missing cookies object entirely', () => {
      const req = {} as Request; // no cookies property
      expect(getAccessToken(req)).toBeUndefined();
    });

    it('should handle invalid cookie values safely', () => {
      const req = mockRequest({ [COOKIE_NAMES.ACCESS_TOKEN]: { object: 'not-a-string' } });
      expect(getAccessToken(req)).toBeUndefined();
    });
  });
});
