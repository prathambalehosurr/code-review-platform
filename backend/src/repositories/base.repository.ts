import type mongoose from 'mongoose';
import type { Model, QueryOptions, UpdateQuery } from 'mongoose';

type CreateData<TDocument> = Parameters<Model<TDocument>['create']>[0];

export class BaseRepository<TDocument> {
  protected readonly model: Model<TDocument>;

  public constructor(model: Model<TDocument>) {
    this.model = model;
  }

  public async create(data: CreateData<TDocument>): Promise<TDocument> {
    return this.model.create(data);
  }

  public async findById(id: string): Promise<TDocument | null> {
    return this.model.findById(id).exec();
  }

  public async findOne(
    filter: mongoose.QueryFilter<TDocument>,
    options?: QueryOptions<TDocument>,
  ): Promise<TDocument | null> {
    return this.model.findOne(filter, null, options).exec();
  }

  public async findMany(
    filter?: mongoose.QueryFilter<TDocument>,
    options?: QueryOptions<TDocument>,
  ): Promise<TDocument[]> {
    return this.model.find(filter, null, options).exec();
  }

  public async update(id: string, data: UpdateQuery<TDocument>): Promise<TDocument | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  public async delete(id: string): Promise<TDocument | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
