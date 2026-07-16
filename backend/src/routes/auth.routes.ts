import { Router } from 'express';

import {
  getMe,
  handleGithubCallback,
  logoutUser,
  refreshAuth,
  startGithubAuth,
} from '../controllers/auth.controller';
import { asyncHandler, authenticate, authorize } from '../middleware';

export const authRouter = Router();

authRouter.get('/github', startGithubAuth);
authRouter.get('/github/callback', handleGithubCallback);
authRouter.get('/me', authenticate, authorize(), getMe);
authRouter.post('/refresh', asyncHandler(refreshAuth));
authRouter.post('/logout', authenticate, authorize(), logoutUser);
