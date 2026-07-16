import { Router } from 'express';

import {
  getDashboardController,
  getStatisticsController,
  listReviewsController,
  getReviewController,
} from '../controllers/dashboard.controller';
import { asyncHandler, authenticate, authorize } from '../middleware';

export const dashboardRouter = Router();
export const reviewsRouter = Router();
export const statisticsRouter = Router();

// All dashboard routes require authentication
dashboardRouter.use(authenticate, authorize());
reviewsRouter.use(authenticate, authorize());
statisticsRouter.use(authenticate, authorize());

// GET /api/v1/dashboard
dashboardRouter.get('/', asyncHandler(getDashboardController));

// GET /api/v1/reviews
reviewsRouter.get('/', asyncHandler(listReviewsController));
// GET /api/v1/reviews/:id
reviewsRouter.get('/:id', asyncHandler(getReviewController));

// GET /api/v1/statistics
statisticsRouter.get('/', asyncHandler(getStatisticsController));
