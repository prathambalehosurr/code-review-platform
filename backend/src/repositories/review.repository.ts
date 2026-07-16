import { ReviewModel, type Review } from '../models';
import { BaseRepository } from './base.repository';
import { Types } from 'mongoose';

export type ReviewSortField = 'newest' | 'oldest' | 'highestScore' | 'lowestScore';

const sortMap: Record<ReviewSortField, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  highestScore: { overallScore: -1, createdAt: -1 },
  lowestScore: { overallScore: 1, createdAt: -1 },
};

export type ReviewPage = {
  items: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export class ReviewRepository extends BaseRepository<Review> {
  public constructor() {
    super(ReviewModel);
  }

  public async findByRepository(repositoryId: string | Types.ObjectId): Promise<Review[]> {
    return this.findMany({ repository: repositoryId }, { sort: { createdAt: -1 } });
  }

  public async findByOwner(ownerId: string | Types.ObjectId): Promise<Review[]> {
    return this.findMany({ owner: ownerId }, { sort: { createdAt: -1 } });
  }

  public async findLatest(repositoryId: string | Types.ObjectId): Promise<Review | null> {
    return this.findOne({ repository: repositoryId }, { sort: { createdAt: -1 } });
  }

  /** Paginated review listing for the dashboard. */
  public async findPaginated(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sort: ReviewSortField = 'newest',
  ): Promise<ReviewPage> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sortMap[sort]).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Count reviews created after a given date for a set of owner IDs. */
  public async countSince(ownerId: string | Types.ObjectId, since: Date): Promise<number> {
    return this.model.countDocuments({ owner: ownerId, createdAt: { $gte: since } }).exec();
  }

  /** Aggregate severity counts across all reviews for an owner. */
  public async aggregateSeverityCounts(ownerId: string | Types.ObjectId): Promise<{
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  }> {
    const result = await this.model
      .aggregate<{
        _id: null;
        critical: number;
        high: number;
        medium: number;
        low: number;
        info: number;
      }>([
        { $match: { owner: typeof ownerId === 'string' ? new Types.ObjectId(ownerId) : ownerId } },
        {
          $group: {
            _id: null,
            critical: { $sum: '$statistics.critical' },
            high: { $sum: '$statistics.high' },
            medium: { $sum: '$statistics.medium' },
            low: { $sum: '$statistics.low' },
            info: { $sum: '$statistics.info' },
          },
        },
      ])
      .exec();

    return result[0] ?? { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  }

  /** Average overall score for an owner. */
  public async averageScore(ownerId: string | Types.ObjectId): Promise<number> {
    const result = await this.model
      .aggregate<{ _id: null; avg: number }>([
        {
          $match: {
            owner: typeof ownerId === 'string' ? new Types.ObjectId(ownerId) : ownerId,
            overallScore: { $exists: true, $ne: null },
          },
        },
        { $group: { _id: null, avg: { $avg: '$overallScore' } } },
      ])
      .exec();

    return result[0]?.avg ?? 0;
  }

  /** Review trend: count per day for the last N days. */
  public async reviewTrend(
    ownerId: string | Types.ObjectId,
    days: number = 30,
  ): Promise<Array<{ date: string; count: number }>> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await this.model
      .aggregate<{ _id: string; count: number }>([
        {
          $match: {
            owner: typeof ownerId === 'string' ? new Types.ObjectId(ownerId) : ownerId,
            createdAt: { $gte: since },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec();

    return result.map((r: { _id: string; count: number }) => ({ date: r._id, count: r.count }));
  }

  /** Distinct repository IDs that have at least one review for an owner. */
  public async distinctRepositoriesReviewed(ownerId: string | Types.ObjectId): Promise<number> {
    const result = await this.model.distinct('githubRepositoryId', { owner: ownerId }).exec();
    return result.length;
  }
}

export const reviewRepository = new ReviewRepository();
