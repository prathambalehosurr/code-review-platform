import type { UpdateQuery } from 'mongoose';

import { RepositoryModel, type Repository } from '../models';

import { BaseRepository } from './base.repository';

export class RepositoryRepository extends BaseRepository<Repository> {
  public constructor() {
    super(RepositoryModel);
  }

  public async findByGithubRepositoryId(githubRepositoryId: number): Promise<Repository | null> {
    return this.findOne({ githubRepositoryId });
  }

  public async findByOwner(ownerId: string): Promise<Repository[]> {
    return this.findMany({ owner: ownerId }, { sort: { updatedAt: -1 } });
  }

  public async findConnectedRepositories(ownerId: string): Promise<Repository[]> {
    return this.findMany({ owner: ownerId, isConnected: true });
  }

  public async updateRepository(
    id: string,
    data: UpdateQuery<Repository>,
  ): Promise<Repository | null> {
    return this.update(id, data);
  }

  public async updateByGithubRepositoryId(
    githubRepositoryId: number,
    data: UpdateQuery<Repository>,
  ): Promise<Repository | null> {
    const repository = await this.findByGithubRepositoryId(githubRepositoryId);

    if (!repository) {
      return null;
    }

    return this.update(repository._id.toString(), data);
  }
}

export const repositoryRepository = new RepositoryRepository();
