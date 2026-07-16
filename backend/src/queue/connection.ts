import Redis from 'ioredis';
import { environment, logger } from '../config';

let redisInstance: Redis | null = null;

/**
 * Returns a singleton instance of the ioredis client.
 * Configured with `maxRetriesPerRequest: null` as required by BullMQ.
 */
export const getRedisConnection = (): Redis => {
  if (!redisInstance) {
    redisInstance = new Redis(environment.REDIS_URL, {
      maxRetriesPerRequest: null,
    });

    redisInstance.on('error', (error) => {
      logger.error('Redis connection error', {
        error: error instanceof Error ? error.message : String(error),
      });
    });

    redisInstance.on('connect', () => {
      logger.info('Queue connected');
    });
  }
  return redisInstance;
};

/**
 * Pings Redis to verify that the connection is active.
 * Throws an error if Redis is unreachable.
 */
export const verifyRedisConnection = async (): Promise<void> => {
  const connection = getRedisConnection();
  try {
    await connection.ping();
  } catch (error) {
    logger.error('Redis connection verification failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};
