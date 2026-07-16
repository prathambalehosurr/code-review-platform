import type { Server } from 'node:http';
import type { Worker } from 'bullmq';

import { createApp } from './app';
import { environment, logger } from './config';
import { connectDatabase, disconnectDatabase } from './database';
import { getRedisConnection, verifyRedisConnection } from './queue';
import { startReviewWorker } from './workers';

const app = createApp();
let server: Server | null = null;
let isShuttingDown = false;
let worker: Worker | null = null;

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown server error';
};

const closeHttpServer = async (): Promise<void> => {
  if (server === null) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server?.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    // Verify Redis connection - fails startup if unavailable
    await verifyRedisConnection();

    // Start worker asynchronously without blocking Express
    worker = startReviewWorker();

    server = app.listen(environment.PORT, () => {
      logger.info(`Backend server running on port ${environment.PORT}`);
    });
  } catch (error) {
    logger.error(`Server startup failed: ${getErrorMessage(error)}`);
    process.exit(1);
  }
};

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info(`Received ${signal}. Starting graceful shutdown.`);

  try {
    await closeHttpServer();

    if (worker) {
      await worker.close();
    }

    const redis = getRedisConnection();
    await redis.quit();

    await disconnectDatabase();
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error(`Graceful shutdown failed: ${getErrorMessage(error)}`);
    process.exit(1);
  }
};

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

void startServer();
