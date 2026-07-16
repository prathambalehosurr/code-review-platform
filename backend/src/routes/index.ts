import { Router } from 'express';

import { healthRouter } from './health.routes';
import { apiV1Router } from './v1.routes';

export const apiRouter = Router();

apiRouter.use('/api/v1', apiV1Router);
apiRouter.use('/health', healthRouter);
