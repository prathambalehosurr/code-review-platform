import { model, Schema, type InferSchemaType, type Types } from 'mongoose';

const findingSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info'],
      required: true,
    },
    confidence: { type: Number, required: true },
    category: {
      type: String,
      enum: ['bug', 'security', 'performance', 'style', 'maintainability'],
      required: true,
    },
    filename: { type: String, required: true },
    line: { type: Number },
    suggestion: { type: String },
  },
  { _id: false },
);

const statisticsSchema = new Schema(
  {
    filesReviewed: { type: Number, required: true, default: 0 },
    additions: { type: Number, required: true, default: 0 },
    deletions: { type: Number, required: true, default: 0 },
    findingsCount: { type: Number, required: true, default: 0 },
    critical: { type: Number, required: true, default: 0 },
    high: { type: Number, required: true, default: 0 },
    medium: { type: Number, required: true, default: 0 },
    low: { type: Number, required: true, default: 0 },
    info: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const reviewSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    repository: {
      type: Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
    },
    githubRepositoryId: {
      type: Number,
      required: true,
    },
    pullRequestNumber: {
      type: Number,
      required: true,
    },
    commitSha: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'published'],
      required: true,
      default: 'pending',
    },
    summary: {
      type: String,
      trim: true,
    },
    overallScore: {
      type: Number,
    },
    findings: {
      type: [findingSchema],
      default: [],
    },
    positives: {
      type: [String],
      default: [],
    },
    statistics: {
      type: statisticsSchema,
      required: true,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reviewSchema.index({ owner: 1 });
reviewSchema.index({ repository: 1 });
reviewSchema.index({ githubRepositoryId: 1 });
reviewSchema.index({ pullRequestNumber: 1 });
reviewSchema.index({ createdAt: -1 });

export type Review = InferSchemaType<typeof reviewSchema> & {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  repository: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const ReviewModel = model<Review>('Review', reviewSchema);
