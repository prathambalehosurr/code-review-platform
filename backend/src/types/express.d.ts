import type { AuthProvider } from './auth';

declare global {
  namespace Express {
    export interface User {
      id: string;
      githubId?: string;
      email: string;
      username: string;
      provider: AuthProvider;
      avatarUrl?: string;
      name?: string;
      createdAt?: string;
      updatedAt?: string;
      githubAccessToken?: string;
    }

    export interface Request {
      requestId: string;
      rawBody?: Buffer;
    }
  }
}

export {};
