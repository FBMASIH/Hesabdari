import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25),
});

export const uuidSchema = z.string().uuid();

export const sortSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

export type PaginationDto = z.infer<typeof paginationSchema>;
export type SortDto = z.infer<typeof sortSchema>;
