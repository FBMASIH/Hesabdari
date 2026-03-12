import { z } from 'zod';
import { paginationSchema } from './common.js';

export const createCustomerSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  taxId: z.string().max(20).optional(),
  isActive: z.boolean().default(true),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  id: z.string().uuid(),
});

export const customerQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export const customerSearchSchema = z.object({
  q: z.string().min(1),
});

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;
export type CustomerQueryDto = z.infer<typeof customerQuerySchema>;
export type CustomerSearchDto = z.infer<typeof customerSearchSchema>;
