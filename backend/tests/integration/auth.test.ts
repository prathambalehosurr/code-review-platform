import supertest from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app';
import { COOKIE_NAMES } from '../../src/constants';
import { generateAccessToken, generateRefreshToken } from '../../src/services/auth/jwt.service';
import { UserFactory } from '../factories';

const app = createApp();

describe('Auth API', () => {
  describe('GET /api/v1/auth/me', () => {
    it('should return 401 when no cookie is present', async () => {
      const response = await supertest(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return user profile for authenticated user', async () => {
      const user = await UserFactory.create();

      const token = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
      });

      const response = await supertest(app)
        .get('/api/v1/auth/me')
        .set('Cookie', `${COOKIE_NAMES.ACCESS_TOKEN}=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(user._id.toString());
      expect(response.body.data.username).toBe(user.username);
    });

    it('should return 401 if user does not exist in DB anymore', async () => {
      const token = generateAccessToken({
        userId: '123456789012345678901234',
        email: 'test@example.com',
        username: 'test',
      });

      const response = await supertest(app)
        .get('/api/v1/auth/me')
        .set('Cookie', `${COOKIE_NAMES.ACCESS_TOKEN}=${token}`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should return 401 if refresh token is missing', async () => {
      const response = await supertest(app).post('/api/v1/auth/refresh');
      expect(response.status).toBe(401);
    });

    it('should refresh tokens and set new cookies', async () => {
      const user = await UserFactory.create();
      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
      });

      const response = await supertest(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `${COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.includes(COOKIE_NAMES.ACCESS_TOKEN))).toBe(true);
      expect(cookies.some((c: string) => c.includes(COOKIE_NAMES.REFRESH_TOKEN))).toBe(true);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await supertest(app).post('/api/v1/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should clear all cookies for authenticated user', async () => {
      const user = await UserFactory.create();
      const token = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
      });

      const response = await supertest(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', `${COOKIE_NAMES.ACCESS_TOKEN}=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(
        cookies.some((cookie: string) => cookie.includes('Expires=Thu, 01 Jan 1970 00:00:00 GMT')),
      ).toBe(true);
    });
  });
});
