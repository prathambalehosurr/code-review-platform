import { z } from 'zod';

export const reviewFindingSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  confidence: z.number().int().min(0).max(100),
  category: z.enum(['bug', 'security', 'performance', 'style', 'maintainability']),
  filename: z.string().min(1),
  line: z.number().int().min(0).optional(),
  suggestion: z.string().optional(),
});

export const reviewResultSchema = z.object({
  summary: z.string().min(1),
  overallScore: z.number().int().min(0).max(100),
  findings: z.array(reviewFindingSchema),
  positives: z.array(z.string()),
});

export type ReviewFinding = z.infer<typeof reviewFindingSchema>;
export type ReviewResult = z.infer<typeof reviewResultSchema>;
