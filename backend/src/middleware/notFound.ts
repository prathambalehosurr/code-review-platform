import type { RequestHandler } from 'express';

import { API_MESSAGES, ERROR_CODES, HTTP_STATUS } from '../constants';
import { createErrorResponse } from '../utils';

export const notFoundHandler: RequestHandler = (request, response) => {
  response
    .status(HTTP_STATUS.NOT_FOUND)
    .json(
      createErrorResponse(
        API_MESSAGES.ROUTE_NOT_FOUND,
        [],
        ERROR_CODES.NOT_FOUND,
        request.requestId,
      ),
    );
};
