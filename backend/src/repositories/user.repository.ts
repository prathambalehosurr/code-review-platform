import type { UpdateQuery } from 'mongoose';

import { UserModel, type User } from '../models';

import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<User> {
  public constructor() {
    super(UserModel);
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  public async findByGithubId(githubId: string): Promise<User | null> {
    return this.findOne({ githubId });
  }

  public async updateLastLogin(id: string): Promise<User | null> {
    return this.update(id, { lastLoginAt: new Date() } satisfies UpdateQuery<User>);
  }
}

export const userRepository = new UserRepository();
