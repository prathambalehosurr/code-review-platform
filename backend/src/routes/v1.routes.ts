import { Router } from 'express';

import { authRouter } from './auth.routes';
import { dashboardRouter, reviewsRouter, statisticsRouter } from './dashboard.routes';
import { healthRouter } from './health.routes';
import { repositoryRouter } from './repository.routes';
import { webhookRouter } from './webhook.routes';

export const apiV1Router = Router();

apiV1Router.use('/auth', authRouter);
apiV1Router.use('/health', healthRouter);
apiV1Router.use('/repositories', repositoryRouter);
apiV1Router.use('/webhooks', webhookRouter);

apiV1Router.use('/dashboard', dashboardRouter);
apiV1Router.use('/reviews', reviewsRouter);
apiV1Router.use('/statistics', statisticsRouter);
