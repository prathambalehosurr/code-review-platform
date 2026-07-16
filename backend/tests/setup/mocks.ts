import { vi } from 'vitest';

// Mock ioredis
vi.mock('ioredis', () => {
  class RedisMock {
    on = vi.fn();
    quit = vi.fn().mockResolvedValue('OK');
    ping = vi.fn().mockResolvedValue('PONG');

    constructor(_url?: string, _options?: unknown) {}
  }

  return { default: RedisMock, Redis: RedisMock };
});

// Mock bullmq
vi.mock('bullmq', () => {
  class QueueMock {
    add = vi.fn().mockResolvedValue({ id: 'mock-job-id' });
    close = vi.fn().mockResolvedValue(undefined);

    constructor(_name?: string, _options?: unknown) {}
  }

  class WorkerMock {
    on = vi.fn();
    close = vi.fn().mockResolvedValue(undefined);

    constructor(_name?: string, _processor?: unknown, _options?: unknown) {}
  }

  return { Queue: QueueMock, Worker: WorkerMock };
});

// Mock passport-github2
vi.mock('passport-github2', () => {
  return {
    Strategy: vi.fn().mockImplementation(function (options, verify) {
      this.name = 'github';
      this.verify = verify;
      this.authenticate = vi.fn((req) => {
        // Mock implementation of authenticate will just call success
        // This is usually handled better in tests using supertest by mocking the middleware directly.
      });
    }),
  };
});

// Mock Octokit
vi.mock('@octokit/rest', () => {
  const OctokitMock = vi.fn().mockImplementation(() => ({
    repos: {
      get: vi.fn().mockResolvedValue({ data: {} }),
      listForAuthenticatedUser: vi.fn().mockResolvedValue({ data: [] }),
    },
    pulls: {
      get: vi.fn().mockResolvedValue({ data: {} }),
    },
    issues: {
      createComment: vi.fn().mockResolvedValue({ data: {} }),
    },
  }));
  return { Octokit: OctokitMock };
});

// Mock @google/genai
vi.mock('@google/genai', () => {
  const GoogleGenAIMock = vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: '{"summary": "Mock review summary"}',
      }),
    },
  }));
  return { GoogleGenAI: GoogleGenAIMock };
});
