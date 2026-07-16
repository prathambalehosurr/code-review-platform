import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

export type RequestValidationSchema = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

type ValidatedRequestHandler = RequestHandler<
  Record<string, string>,
  unknown,
  unknown,
  Record<string, unknown>
>;

export const validate = (schema: RequestValidationSchema): ValidatedRequestHandler => {
  return (request, _response, next) => {
    if (schema.body) {
      request.body = schema.body.parse(request.body);
    }

    if (schema.params) {
      request.params = schema.params.parse(request.params) as typeof request.params;
    }

    if (schema.query) {
      request.query = schema.query.parse(request.query) as typeof request.query;
    }

    next();
  };
};
