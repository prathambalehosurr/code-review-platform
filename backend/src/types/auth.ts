import type { Types } from 'mongoose';

import type { AUTH_PROVIDER, TOKEN_TYPES } from '../constants';

export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER];
export type TokenType = (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES];

export type JwtPayload = {
  userId: string;
  email: string;
  username: string;
  tokenType: TokenType;
};

export type AuthenticatedUser = {
  id: string;
  githubId?: string;
  email: string;
  username: string;
  provider: AuthProvider;
  avatarUrl?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GithubProfile = {
  githubId: string;
  username: string;
  email: string;
  avatarUrl?: string;
  name?: string;
};

export type UserId = string | Types.ObjectId;
