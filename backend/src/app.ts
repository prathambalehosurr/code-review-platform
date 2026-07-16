import type { IncomingMessage, ServerResponse } from 'node:http';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { environment } from './config';
import { passport } from './config/passport';
import { setupSwagger } from './docs';
import { errorHandler, notFoundHandler, requestIdMiddleware, requestLogger } from './middleware';
import { apiRouter } from './routes';

export const createApp = (): express.Express => {
  const app = express();

  app.use(helmet());
  // Swagger UI requires relaxed CSP; apply per-path override before global cors
  app.use('/api/docs', helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: environment.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(requestIdMiddleware);
  app.use(requestLogger);
  app.use(cookieParser());
  app.use(
    express.json({
      verify: (req: IncomingMessage, _res: ServerResponse, buf: Buffer) => {
        (req as express.Request).rawBody = buf;
      },
    }),
  );
  app.use(passport.initialize());

  // Documentation – mounted before API router so not included in v1 prefix
  setupSwagger(app);

  app.use(apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
