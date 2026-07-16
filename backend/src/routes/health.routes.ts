import { Router } from 'express';

import { getDatabaseHealth, getHealth } from '../controllers/health.controller';
import { asyncHandler } from '../middleware';

export const healthRouter = Router();

healthRouter.get('/', asyncHandler(getHealth));
healthRouter.get('/database', asyncHandler(getDatabaseHealth));
