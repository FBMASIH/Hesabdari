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

export type CreateAccountDto = z.infer<typeof createAccountSchema>;
export type UpdateAccountDto = z.infer<typeof updateAccountSchema>;
