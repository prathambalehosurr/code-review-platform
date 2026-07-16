import jwt, {
  type JwtPayload as JsonWebTokenPayload,
  type Secret,
  type SignOptions,
} from 'jsonwebtoken';

import { environment } from '../../config';
import { TOKEN_TYPES } from '../../constants';
import { AuthenticationError } from '../../errors';
import type { JwtPayload, TokenType } from '../../types';

const getSignOptions = (expiresIn: string): SignOptions => {
  return {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };
};

const isTokenPayload = (decoded: string | JsonWebTokenPayload, tokenType: TokenType): boolean => {
  if (typeof decoded === 'string') {
    return false;
  }

  const payload = decoded as Partial<JwtPayload>;

  return (
    typeof payload.userId === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.username === 'string' &&
    payload.tokenType === tokenType
  );
};

const verifyToken = (token: string, secret: Secret, tokenType: TokenType): JwtPayload => {
  try {
    const decoded = jwt.verify(token, secret);

    if (!isTokenPayload(decoded, tokenType)) {
      throw new AuthenticationError('Invalid token payload');
    }

    return decoded as JwtPayload;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    throw new AuthenticationError('Invalid or expired token');
  }
};

export const generateAccessToken = (payload: Omit<JwtPayload, 'tokenType'>): string => {
  return jwt.sign(
    { ...payload, tokenType: TOKEN_TYPES.ACCESS },
    environment.JWT_ACCESS_SECRET,
    getSignOptions(environment.JWT_ACCESS_EXPIRES_IN),
  );
};

export const generateRefreshToken = (payload: Omit<JwtPayload, 'tokenType'>): string => {
  return jwt.sign(
    { ...payload, tokenType: TOKEN_TYPES.REFRESH },
    environment.JWT_REFRESH_SECRET,
    getSignOptions(environment.JWT_REFRESH_EXPIRES_IN),
  );
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return verifyToken(token, environment.JWT_ACCESS_SECRET, TOKEN_TYPES.ACCESS);
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return verifyToken(token, environment.JWT_REFRESH_SECRET, TOKEN_TYPES.REFRESH);
};
