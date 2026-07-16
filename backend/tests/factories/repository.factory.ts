import mongoose from 'mongoose';

import { RepositoryModel, type Repository } from '../../src/models/repository.model';

export const RepositoryFactory = {
  create: async (
    userId: mongoose.Types.ObjectId,
    overrides: Partial<Repository> = {},
  ): Promise<Repository> => {
    const repository = new RepositoryModel({
      githubRepositoryId: Math.floor(Math.random() * 1_000_000),
      owner: userId,
      name: `repo-${Date.now()}`,
      fullName: `testuser/repo-${Date.now()}`,
      private: false,
      htmlUrl: 'https://github.com/testuser/repo',
      cloneUrl: 'https://github.com/testuser/repo.git',
      defaultBranch: 'main',
      isConnected: false,
      aiSettings: {
        enabled: true,
        reviewLevel: 'standard',
        maxFiles: 50,
        maxPatchCharacters: 3000,
        includeSecurity: true,
        includePerformance: true,
        includeMaintainability: true,
        includeBestPractices: true,
        ignoredPaths: [],
        model: 'gemini-2.5-flash',
      },
      ...overrides,
    });

    return repository.save();
  },
};
