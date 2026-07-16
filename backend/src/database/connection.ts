import mongoose from 'mongoose';

import { environment, logger } from '../config';

let connectionPromise: Promise<typeof mongoose> | null = null;

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown database error';
};

export const connectDatabase = async (): Promise<typeof mongoose> => {
  const { readyState } = mongoose.connection;

  if (readyState === mongoose.STATES.connected) {
    logger.debug('MongoDB connection already established');
    return mongoose;
  }

  if (connectionPromise !== null) {
    logger.debug('MongoDB connection already in progress');
    return connectionPromise;
  }

  connectionPromise = mongoose.connect(environment.MONGODB_URI, {
    serverSelectionTimeoutMS: environment.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
  });

  try {
    const connection = await connectionPromise;
    logger.info('MongoDB connected successfully');
    return connection;
  } catch (error) {
    connectionPromise = null;
    logger.error(`MongoDB connection failed: ${getErrorMessage(error)}`);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === mongoose.STATES.disconnected) {
    logger.debug('MongoDB connection already disconnected');
    return;
  }

  await mongoose.disconnect();
  connectionPromise = null;
  logger.info('MongoDB disconnected successfully');
};
