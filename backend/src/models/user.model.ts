import { model, Schema, type InferSchemaType, type Types } from 'mongoose';

import { AUTH_PROVIDER } from '../constants';

const userSchema = new Schema(
  {
    githubId: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    provider: {
      type: String,
      enum: Object.values(AUTH_PROVIDER),
      required: true,
      default: AUTH_PROVIDER.GITHUB,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ email: 1 });
userSchema.index({ githubId: 1 });
userSchema.index({ username: 1 });

export type User = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const UserModel = model<User>('User', userSchema);
