import { z } from 'zod';
import { paginationSchema } from './common.js';

export const createBankSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
});

export const updateBankSchema = createBankSchema.partial().extend({
  id: z.string().uuid(),
});

export const bankQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
});

export type CreateBankDto = z.infer<typeof createBankSchema>;
export type UpdateBankDto = z.infer<typeof updateBankSchema>;
export type BankQueryDto = z.infer<typeof bankQuerySchema>;
