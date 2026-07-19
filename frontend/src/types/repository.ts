export type AiSettings = {
  enabled: boolean;
  reviewLevel: 'light' | 'standard' | 'strict';
  maxFiles: number;
  maxPatchCharacters: number;
  includeSecurity: boolean;
  includePerformance: boolean;
  includeMaintainability: boolean;
  includeBestPractices: boolean;
  ignoredPaths: string[];
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro';
};

export type Repository = {
  id: string;
  githubRepositoryId: number;
  name: string;
  fullName: string;
  defaultBranch: string;
  private: boolean;
  language?: string;
  description?: string;
  cloneUrl: string;
  htmlUrl: string;
  installationId?: number;
  isConnected: boolean;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
};
