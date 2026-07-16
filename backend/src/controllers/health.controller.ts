import type { Request, Response } from 'express';

import { isDatabaseConnected } from '../database/health';
import { HTTP_STATUS } from '../constants';
import { createSuccessResponse, success } from '../utils';

export const getHealth = (_req: Request, res: Response): void => {
  success(res, undefined, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

export const getDatabaseHealth = (_req: Request, res: Response): void => {
  const isConnected = isDatabaseConnected();

  const payload = createSuccessResponse(undefined, {
    status: isConnected ? 'ok' : 'error',
    database: isConnected ? 'connected' : 'disconnected',
  });

  res.status(isConnected ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE).json(payload);
};
