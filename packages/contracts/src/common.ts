import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25),
});

export const uuidSchema = z.string().uuid();

export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

export const sortSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Creates a paginated + sortable query schema with a whitelist of allowed sort fields.
 * If sortBy is not in the whitelist, it defaults to the provided defaultSortBy.
 */
export function createSortableQuerySchema<T extends readonly [string, ...string[]]>(
  allowedFields: T,
  defaultSortBy: T[number] = 'createdAt' as T[number],
  defaultSortOrder: 'asc' | 'desc' = 'desc',
) {
  return paginationSchema.extend({
    sortBy: z.enum(allowedFields).default(defaultSortBy as T[number]),
    sortOrder: z.enum(['asc', 'desc']).default(defaultSortOrder),
  });
}

export type PaginationDto = z.infer<typeof paginationSchema>;
export type SortDto = z.infer<typeof sortSchema>;
export type SortOrder = 'asc' | 'desc';
