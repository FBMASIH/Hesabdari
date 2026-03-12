import { z } from 'zod';
import { paginationSchema } from './common.js';

export const createVendorSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  taxId: z.string().max(20).optional(),
  isActive: z.boolean().default(true),
});

export const updateVendorSchema = createVendorSchema.partial().extend({
  id: z.string().uuid(),
});

export const vendorQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export const vendorSearchSchema = z.object({
  q: z.string().min(1),
});

export type CreateVendorDto = z.infer<typeof createVendorSchema>;
export type UpdateVendorDto = z.infer<typeof updateVendorSchema>;
export type VendorQueryDto = z.infer<typeof vendorQuerySchema>;
export type VendorSearchDto = z.infer<typeof vendorSearchSchema>;
