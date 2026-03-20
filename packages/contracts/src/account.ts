import { z } from 'zod';

const accountTypeEnum = z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']);

export const createAccountSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  type: accountTypeEnum,
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
});

export const updateAccountSchema = createAccountSchema.partial().extend({
  id: z.string().uuid(),
});

const ACCOUNT_SORTABLE_FIELDS = [
  'code',
  'name',
  'type',
  'createdAt',
  'updatedAt',
  'isActive',
] as const;

export const accountQuerySchema = z.object({
  sortBy: z.enum(ACCOUNT_SORTABLE_FIELDS).default('code'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateAccountDto = z.infer<typeof createAccountSchema>;
export type UpdateAccountDto = z.infer<typeof updateAccountSchema>;
export type AccountQueryDto = z.infer<typeof accountQuerySchema>;
