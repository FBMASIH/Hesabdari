import { z } from 'zod';
import { paginationSchema } from './common.js';

const costingMethodEnum = z.enum(['FIFO', 'LIFO', 'AVERAGE']);

export const createWarehouseSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  costingMethod: costingMethodEnum.default('FIFO'),
  isActive: z.boolean().default(true),
});

export const updateWarehouseSchema = createWarehouseSchema.partial().extend({
  id: z.string().uuid(),
});

const WAREHOUSE_SORTABLE_FIELDS = [
  'code',
  'name',
  'createdAt',
  'updatedAt',
  'costingMethod',
  'isActive',
] as const;

export const warehouseQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(WAREHOUSE_SORTABLE_FIELDS).default('code'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateWarehouseDto = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseDto = z.infer<typeof updateWarehouseSchema>;
export type WarehouseQueryDto = z.infer<typeof warehouseQuerySchema>;
