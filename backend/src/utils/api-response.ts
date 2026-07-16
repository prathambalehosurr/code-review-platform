import type { Response } from 'express';

import { ERROR_CODES, HTTP_STATUS } from '../constants';

export type ApiSuccessResponse<TData> = {
  success: true;
  message?: string;
  data?: TData;
};

export type ApiErrorResponse = {
  success: false;
  requestId?: string;
  error: {
    code: string;
    message: string;
    details?: readonly unknown[];
  };
};

export const createSuccessResponse = <TData>(
  message?: string,
  data?: TData,
): ApiSuccessResponse<TData> => {
  const successResponse: ApiSuccessResponse<TData> = {
    success: true,
  };

  if (message) {
    successResponse.message = message;
  }

  if (data !== undefined) {
    successResponse.data = data;
  }

  return successResponse;
};

export const createErrorResponse = (
  message: string,
  errors: readonly unknown[] = [],
  code: string = ERROR_CODES.INTERNAL_SERVER_ERROR,
  requestId?: string,
): ApiErrorResponse => {
  const errorResponse: ApiErrorResponse = {
    success: false,
    requestId,
    error: {
      code,
      message,
    },
  };

  if (errors.length > 0) {
    errorResponse.error.details = errors;
  }

  return errorResponse;
};

export const createErrorResponseWithDetails = (
  message: string,
  errors: readonly unknown[] = [],
  code: string = ERROR_CODES.INTERNAL_SERVER_ERROR,
  requestId?: string,
): ApiErrorResponse => {
  return {
    success: false,
    requestId,
    error: {
      code,
      message,
      details: errors,
    },
  };
};

export const success = <TData>(response: Response, message?: string, data?: TData): void => {
  response.status(HTTP_STATUS.OK).json(createSuccessResponse(message, data));
};

export const created = <TData>(response: Response, message?: string, data?: TData): void => {
  response.status(HTTP_STATUS.CREATED).json(createSuccessResponse(message, data));
};

export const badRequest = (
  response: Response,
  message: string,
  errors: readonly unknown[] = [],
): void => {
  response
    .status(HTTP_STATUS.BAD_REQUEST)
    .json(createErrorResponse(message, errors, ERROR_CODES.VALIDATION_ERROR));
};

export const unauthorized = (response: Response, message = 'Unauthorized'): void => {
  response
    .status(HTTP_STATUS.UNAUTHORIZED)
    .json(createErrorResponse(message, [], ERROR_CODES.AUTHENTICATION_ERROR));
};

export const forbidden = (response: Response, message = 'Forbidden'): void => {
  response
    .status(HTTP_STATUS.FORBIDDEN)
    .json(createErrorResponse(message, [], ERROR_CODES.AUTHORIZATION_ERROR));
};

export const notFound = (response: Response, message = 'Resource not found'): void => {
  response
    .status(HTTP_STATUS.NOT_FOUND)
    .json(createErrorResponse(message, [], ERROR_CODES.NOT_FOUND));
};

export const serverError = (response: Response, message = 'Internal server error'): void => {
  response
    .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .json(createErrorResponse(message, [], ERROR_CODES.INTERNAL_SERVER_ERROR));
};
