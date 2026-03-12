import { z } from 'zod';
import { paginationSchema } from './common.js';

export const createCashboxSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  currencyId: z.string().uuid(),
  isActive: z.boolean().default(true),
});

export const updateCashboxSchema = createCashboxSchema.partial().extend({
  id: z.string().uuid(),
});

export const cashboxQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type CreateCashboxDto = z.infer<typeof createCashboxSchema>;
export type UpdateCashboxDto = z.infer<typeof updateCashboxSchema>;
export type CashboxQueryDto = z.infer<typeof cashboxQuerySchema>;
