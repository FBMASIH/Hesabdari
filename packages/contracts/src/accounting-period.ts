import { z } from 'zod';

export const accountingPeriodStatusEnum = z.enum(['OPEN', 'CLOSED']);

export const createAccountingPeriodSchema = z.object({
  name: z.string().min(1).max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'ISO 8601 date required (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'ISO 8601 date required (YYYY-MM-DD)'),
});

export const closeAccountingPeriodSchema = z.object({
  id: z.string().uuid(),
});

export type CreateAccountingPeriodDto = z.infer<typeof createAccountingPeriodSchema>;
export type CloseAccountingPeriodDto = z.infer<typeof closeAccountingPeriodSchema>;
export type AccountingPeriodStatus = z.infer<typeof accountingPeriodStatusEnum>;
