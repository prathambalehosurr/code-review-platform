import { z } from 'zod';

export const updateRepositorySettingsSchema = z.object({
  body: z
    .object({
      enabled: z.boolean().optional(),
      reviewLevel: z.enum(['light', 'standard', 'strict']).optional(),
      maxFiles: z.number().int().min(1).max(500).optional(),
      maxPatchCharacters: z.number().int().min(100).max(10000).optional(),
      includeSecurity: z.boolean().optional(),
      includePerformance: z.boolean().optional(),
      includeMaintainability: z.boolean().optional(),
      includeBestPractices: z.boolean().optional(),
      ignoredPaths: z.array(z.string()).optional(),
      model: z.enum(['gemini-2.5-flash', 'gemini-2.5-pro']).optional(),
    })
    .strict(),
  params: z
    .object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid repository ID'),
    })
    .strict(),
});
