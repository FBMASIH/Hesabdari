import { z } from 'zod';
import { paginationSchema } from './common.js';

export const createCustomerSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  referrer: z.string().max(200).optional(),
  title: z.string().max(200).optional(),
  phone1: z.string().max(20).optional(),
  phone2: z.string().max(20).optional(),
  phone3: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  creditLimit: z.string().regex(/^\d+$/, 'must be a non-negative integer string').optional(),
  nationalId: z.string().max(20).optional(),
  economicCode: z.string().max(20).optional(),
  postalCode: z.string().max(20).optional(),
  bankAccount1: z.string().max(50).optional(),
  bankAccount2: z.string().max(50).optional(),
  bankAccount3: z.string().max(50).optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be ISO 8601 date (YYYY-MM-DD)')
    .optional(),
  description: z.string().max(1000).optional(),
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
