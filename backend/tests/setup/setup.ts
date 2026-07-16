import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import './mocks';

// Mute console output during tests to keep the output clean
vi.spyOn(console, 'info').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Set required environment variables for tests
  process.env.NODE_ENV = 'test';
  process.env.PORT = '5000';
  process.env.LOG_LEVEL = 'error';
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-which-needs-to-be-32-chars-long';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-which-needs-to-be-32-chars-long';
  process.env.JWT_ACCESS_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  process.env.CLIENT_URL = 'http://localhost:3000';
  process.env.GITHUB_CLIENT_ID = 'test-client-id';
  process.env.GITHUB_CLIENT_SECRET = 'test-client-secret';
  process.env.GITHUB_CALLBACK_URL = 'http://localhost:5000/api/v1/auth/github/callback';
  process.env.GITHUB_WEBHOOK_SECRET = 'test-webhook-secret';
  process.env.REDIS_URL = 'redis://localhost:6379';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  vi.clearAllMocks();
});
