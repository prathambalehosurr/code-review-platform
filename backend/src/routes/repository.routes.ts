import { Router } from 'express';

import {
  connectRepositoryController,
  createRepositoryController,
  deleteRepositoryController,
  disconnectRepositoryController,
  getRepositoryController,
  getRepositorySettingsController,
  listRepositoryController,
  syncRepositoriesController,
  updateRepositorySettingsController,
} from '../controllers/repository.controller';
import { listRepositoryReviewsController } from '../controllers/dashboard.controller';
import { asyncHandler, authenticate, authorize, validate } from '../middleware';
import {
  createRepositorySchema,
  repositoryParamsSchema,
  updateRepositorySettingsSchema,
} from '../validators';

export const repositoryRouter = Router();

repositoryRouter.use(authenticate, authorize());

repositoryRouter.get('/', asyncHandler(listRepositoryController));
repositoryRouter.post('/sync', asyncHandler(syncRepositoriesController));
repositoryRouter.get(
  '/:id',
  validate({ params: repositoryParamsSchema }),
  asyncHandler(getRepositoryController),
);
repositoryRouter.post(
  '/',
  validate({ body: createRepositorySchema }),
  asyncHandler(createRepositoryController),
);
repositoryRouter.patch(
  '/:id/connect',
  validate({ params: repositoryParamsSchema }),
  asyncHandler(connectRepositoryController),
);
repositoryRouter.patch(
  '/:id/disconnect',
  validate({ params: repositoryParamsSchema }),
  asyncHandler(disconnectRepositoryController),
);
repositoryRouter.delete(
  '/:id',
  validate({ params: repositoryParamsSchema }),
  asyncHandler(deleteRepositoryController),
);
repositoryRouter.get(
  '/:id/settings',
  validate({ params: repositoryParamsSchema }),
  asyncHandler(getRepositorySettingsController),
);
repositoryRouter.get(
  '/:id/reviews',
  validate({ params: repositoryParamsSchema }),
  asyncHandler(listRepositoryReviewsController),
);
repositoryRouter.patch(
  '/:id/settings',
  validate({
    params: updateRepositorySettingsSchema.shape.params,
    body: updateRepositorySettingsSchema.shape.body,
  }),
  asyncHandler(updateRepositorySettingsController),
);
