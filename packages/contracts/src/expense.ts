import { z } from 'zod';
import { paginationSchema } from './common.js';

export const createExpenseSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  isActive: z.boolean().default(true),
});

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  id: z.string().uuid(),
});

export const expenseQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDto = z.infer<typeof updateExpenseSchema>;
export type ExpenseQueryDto = z.infer<typeof expenseQuerySchema>;
