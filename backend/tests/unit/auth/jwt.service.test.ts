import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';

import { environment } from '../../../src/config';
import { TOKEN_TYPES } from '../../../src/constants';
import { AuthenticationError } from '../../../src/errors';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../../src/services/auth/jwt.service';

describe('JWT Service', () => {
  const payload = {
    userId: '123456789012345678901234',
    email: 'test@example.com',
    username: 'testuser',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(payload);
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, environment.JWT_ACCESS_SECRET) as jwt.JwtPayload;
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.username).toBe(payload.username);
      expect(decoded.tokenType).toBe(TOKEN_TYPES.ACCESS);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(payload);
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, environment.JWT_REFRESH_SECRET) as jwt.JwtPayload;
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.username).toBe(payload.username);
      expect(decoded.tokenType).toBe(TOKEN_TYPES.REFRESH);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.tokenType).toBe(TOKEN_TYPES.ACCESS);
    });

    it('should throw AuthenticationError if token is invalid', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError if token has wrong type', () => {
      const refreshToken = generateRefreshToken(payload);
      expect(() => verifyAccessToken(refreshToken)).toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError if payload is missing fields', () => {
      const invalidToken = jwt.sign(
        { userId: payload.userId, tokenType: TOKEN_TYPES.ACCESS },
        environment.JWT_ACCESS_SECRET,
      );
      expect(() => verifyAccessToken(invalidToken)).toThrow(AuthenticationError);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.tokenType).toBe(TOKEN_TYPES.REFRESH);
    });

    it('should throw AuthenticationError if token has wrong type', () => {
      const accessToken = generateAccessToken(payload);
      expect(() => verifyRefreshToken(accessToken)).toThrow(AuthenticationError);
    });
  });
});
