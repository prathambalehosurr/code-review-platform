import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { environment, logger } from '../config';
import { API_MESSAGES, ERROR_CODES, HTTP_STATUS } from '../constants';
import { AppError } from '../errors';
import { createErrorResponse } from '../utils';

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : API_MESSAGES.INTERNAL_SERVER_ERROR;
};

const getErrorStack = (error: unknown): string | undefined => {
  if (environment.NODE_ENV === 'production') {
    return undefined;
  }

  return error instanceof Error ? error.stack : undefined;
};

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  if (error instanceof ZodError) {
    response
      .status(HTTP_STATUS.BAD_REQUEST)
      .json(
        createErrorResponse(
          API_MESSAGES.VALIDATION_FAILED,
          error.issues,
          ERROR_CODES.VALIDATION_ERROR,
          request.requestId,
        ),
      );
    return;
  }

  if (error instanceof AppError) {
    response
      .status(error.statusCode)
      .json(createErrorResponse(error.message, error.errors, error.code, request.requestId));
    return;
  }

  logger.error('Unhandled request error', {
    requestId: request.requestId,
    method: request.method,
    url: request.originalUrl,
    error: getErrorMessage(error),
    stack: getErrorStack(error),
  });

  response
    .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .json(
      createErrorResponse(
        API_MESSAGES.INTERNAL_SERVER_ERROR,
        [],
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        request.requestId,
      ),
    );
};
