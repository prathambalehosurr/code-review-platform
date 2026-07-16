import { model, Schema, type InferSchemaType, type Types } from 'mongoose';

const aiSettingsSchema = new Schema(
  {
    enabled: { type: Boolean, required: true, default: true },
    reviewLevel: {
      type: String,
      enum: ['light', 'standard', 'strict'],
      required: true,
      default: 'standard',
    },
    maxFiles: { type: Number, required: true, default: 50 },
    maxPatchCharacters: { type: Number, required: true, default: 3000 },
    includeSecurity: { type: Boolean, required: true, default: true },
    includePerformance: { type: Boolean, required: true, default: true },
    includeMaintainability: { type: Boolean, required: true, default: true },
    includeBestPractices: { type: Boolean, required: true, default: true },
    ignoredPaths: { type: [String], required: true, default: [] },
    model: {
      type: String,
      enum: ['gemini-2.5-flash', 'gemini-2.5-pro'],
      required: true,
      default: 'gemini-2.5-flash',
    },
  },
  { _id: false },
);

const repositorySchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    githubRepositoryId: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    defaultBranch: {
      type: String,
      required: true,
      trim: true,
    },
    private: {
      type: Boolean,
      required: true,
    },
    language: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    cloneUrl: {
      type: String,
      required: true,
      trim: true,
    },
    htmlUrl: {
      type: String,
      required: true,
      trim: true,
    },
    installationId: {
      type: Number,
    },
    isConnected: {
      type: Boolean,
      required: true,
      default: false,
    },
    lastSyncedAt: {
      type: Date,
    },
    aiSettings: {
      type: aiSettingsSchema,
      required: true,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

repositorySchema.index({ owner: 1 });
repositorySchema.index({ fullName: 1 });

export type Repository = InferSchemaType<typeof repositorySchema> & {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const RepositoryModel = model<Repository>('Repository', repositorySchema);
