import type { RequestHandler } from 'express';

import { AuthenticationError } from '../errors';

export const authorize = (): RequestHandler => {
  return (request, _response, next) => {
    if (!request.user) {
      next(new AuthenticationError('Authenticated user is required'));
      return;
    }

    next();
  };
};
