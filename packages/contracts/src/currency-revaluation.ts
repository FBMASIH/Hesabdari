import { z } from 'zod';
import { paginationSchema } from './common.js';

export const createRevaluationSchema = z.object({
  periodId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().max(500).optional(),
});

const REVALUATION_SORTABLE_FIELDS = [
  'date',
  'status',
  'createdAt',
] as const;

export const revaluationQuerySchema = paginationSchema.extend({
  periodId: z.string().uuid().optional(),
  status: z.enum(['POSTED', 'REVERSED']).optional(),
  sortBy: z.enum(REVALUATION_SORTABLE_FIELDS).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateRevaluationDto = z.infer<typeof createRevaluationSchema>;
export type RevaluationQueryDto = z.infer<typeof revaluationQuerySchema>;
