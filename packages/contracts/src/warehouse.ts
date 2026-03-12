import { z } from 'zod';
import { paginationSchema } from './common.js';

export const createWarehouseSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  address: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

export const updateWarehouseSchema = createWarehouseSchema.partial().extend({
  id: z.string().uuid(),
});

export const warehouseQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type CreateWarehouseDto = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseDto = z.infer<typeof updateWarehouseSchema>;
export type WarehouseQueryDto = z.infer<typeof warehouseQuerySchema>;
