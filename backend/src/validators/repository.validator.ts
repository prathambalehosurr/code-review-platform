import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid repository id');

export const repositoryParamsSchema = z.object({
  id: objectIdSchema,
});

export const createRepositorySchema = z.object({
  githubRepositoryId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1),
  fullName: z.string().trim().min(1),
  defaultBranch: z.string().trim().min(1),
  private: z.boolean(),
  language: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  cloneUrl: z.string().trim().url(),
  htmlUrl: z.string().trim().url(),
  installationId: z.coerce.number().int().positive().optional(),
});

export const updateRepositorySchema = createRepositorySchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one repository field must be provided',
  );

export type CreateRepositoryInput = z.infer<typeof createRepositorySchema>;
export type UpdateRepositoryInput = z.infer<typeof updateRepositorySchema>;
