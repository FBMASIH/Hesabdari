import { z } from 'zod';
import { paginationSchema } from './common.js';

export const createBankAccountSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  accountNumber: z.string().min(1).max(50),
  branch: z.string().max(200).optional(),
  bankId: z.string().uuid(),
  currencyId: z.string().uuid(),
  isActive: z.boolean().default(true),
});

export const updateBankAccountSchema = createBankAccountSchema.partial().extend({
  id: z.string().uuid(),
});

const BANK_ACCOUNT_SORTABLE_FIELDS = [
  'code',
  'name',
  'accountNumber',
  'createdAt',
  'updatedAt',
  'isActive',
] as const;

export const bankAccountQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
  bankId: z.string().uuid().optional(),
  search: z.string().optional(),
  sortBy: z.enum(BANK_ACCOUNT_SORTABLE_FIELDS).default('code'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateBankAccountDto = z.infer<typeof createBankAccountSchema>;
export type UpdateBankAccountDto = z.infer<typeof updateBankAccountSchema>;
export type BankAccountQueryDto = z.infer<typeof bankAccountQuerySchema>;
