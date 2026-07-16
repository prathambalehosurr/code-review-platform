import type { RequestHandler } from 'express';

import { logger } from '../config';
import { AuthenticationError } from '../errors';
import { getAccessToken, getCurrentUser } from '../services';

export const authenticate: RequestHandler = (request, _response, next) => {
  void (async () => {
    try {
      const accessToken = getAccessToken(request);

      if (!accessToken) {
        throw new AuthenticationError('Access token cookie is missing');
      }

      request.user = await getCurrentUser(accessToken);
      next();
    } catch (error) {
      logger.warn('Unauthorized request rejected', {
        requestId: request.requestId,
        method: request.method,
        url: request.originalUrl,
        error: error instanceof Error ? error.message : 'Unknown authentication error',
      });

      next(error);
    }
  })();
};
