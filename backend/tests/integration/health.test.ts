import supertest from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app';

const app = createApp();

describe('Health API', () => {
  it('should return 200 OK for /health', async () => {
    const response = await supertest(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(typeof response.body.data.uptime).toBe('number');
    expect(response.body.data.timestamp).toBeDefined();
  });

  it('should return 200 OK for /api/v1/health', async () => {
    const response = await supertest(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(typeof response.body.data.uptime).toBe('number');
    expect(response.body.data.timestamp).toBeDefined();
  });

  it('should return database health via /api/v1/health/database', async () => {
    const response = await supertest(app).get('/api/v1/health/database');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.database).toBe('connected');
  });

  it('should return 404 for unknown routes', async () => {
    const response = await supertest(app).get('/api/v1/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
