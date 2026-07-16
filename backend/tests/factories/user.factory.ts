import mongoose from 'mongoose';

import { UserModel, type User } from '../../src/models/user.model';

export const UserFactory = {
  create: async (overrides: Partial<User> = {}): Promise<User> => {
    const user = new UserModel({
      githubId: String(Math.floor(Math.random() * 1_000_000)),
      username: `testuser-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      avatarUrl: 'https://github.com/avatar.png',
      ...overrides,
    });

    return user.save();
  },

  build: (overrides: Partial<User> = {}) => {
    return {
      _id: new mongoose.Types.ObjectId(),
      githubId: String(Math.floor(Math.random() * 1_000_000)),
      username: `testuser-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      avatarUrl: 'https://github.com/avatar.png',
      provider: 'github' as const,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  },
};
