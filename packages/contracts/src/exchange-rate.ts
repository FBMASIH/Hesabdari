import { z } from 'zod';
import { paginationSchema } from './common.js';

export const createExchangeRateSchema = z.object({
  fromCurrencyId: z.string().uuid(),
  toCurrencyId: z.string().uuid(),
  rate: z.string().regex(/^\d+(\.\d{1,8})?$/, 'must be a positive decimal with up to 8 places'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  source: z.enum(['MANUAL', 'API']).default('MANUAL'),
});

export const updateExchangeRateSchema = z.object({
  id: z.string().uuid(),
  rate: z.string().regex(/^\d+(\.\d{1,8})?$/, 'must be a positive decimal with up to 8 places'),
});

const EXCHANGE_RATE_SORTABLE_FIELDS = [
  'date',
  'rate',
  'createdAt',
] as const;

export const exchangeRateQuerySchema = paginationSchema.extend({
  fromCurrencyId: z.string().uuid().optional(),
  toCurrencyId: z.string().uuid().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  source: z.enum(['MANUAL', 'API']).optional(),
  sortBy: z.enum(EXCHANGE_RATE_SORTABLE_FIELDS).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateExchangeRateDto = z.infer<typeof createExchangeRateSchema>;
export type UpdateExchangeRateDto = z.infer<typeof updateExchangeRateSchema>;
export type ExchangeRateQueryDto = z.infer<typeof exchangeRateQuerySchema>;
