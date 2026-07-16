import type { RequestHandler } from 'express';

import { logger } from '../config';

export const requestLogger: RequestHandler = (request, response, next) => {
  const startedAt = process.hrtime.bigint();

  response.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logger.info('HTTP request completed', {
      requestId: request.requestId,
      method: request.method,
      url: request.originalUrl,
      statusCode: response.statusCode,
      responseTimeMs: Number(durationMs.toFixed(2)),
      ipAddress: request.ip,
    });
  });

  next();
};
