import { z } from 'zod';
import { paginationSchema } from './common.js';

export const createCurrencySchema = z.object({
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  symbol: z.string().min(1).max(10),
  decimalPlaces: z.number().int().min(0).max(8).default(0),
  isActive: z.boolean().default(true),
});

export const updateCurrencySchema = createCurrencySchema.partial().extend({
  id: z.string().uuid(),
});

export const currencyQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
});

export type CreateCurrencyDto = z.infer<typeof createCurrencySchema>;
export type UpdateCurrencyDto = z.infer<typeof updateCurrencySchema>;
export type CurrencyQueryDto = z.infer<typeof currencyQuerySchema>;
