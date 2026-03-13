import { z } from 'zod';
import { paginationSchema } from './common.js';

export const createProductSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  barcode: z.string().max(50).optional(),
  countingUnit: z.string().min(1).max(50).default('عدد'),
  majorUnit: z.string().max(50).optional(),
  minorUnit: z.string().max(50).optional(),
  quantityInMajorUnit: z.number().int().positive().optional(),
  salePrice1: z.string().regex(/^\d+$/, 'must be a non-negative integer string').default('0'),
  salePrice2: z.string().regex(/^\d+$/, 'must be a non-negative integer string').default('0'),
  salePrice3: z.string().regex(/^\d+$/, 'must be a non-negative integer string').default('0'),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid(),
});

export const productQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export const productSearchSchema = z.object({
  q: z.string().min(1),
});

// Product warehouse stock (opening inventory)
export const createProductWarehouseStockSchema = z.object({
  warehouseId: z.string().uuid(),
  quantity: z.number().int().min(0),
  purchasePrice: z.string().regex(/^\d+$/, 'must be a non-negative integer string'),
  totalPrice: z.string().regex(/^\d+$/, 'must be a non-negative integer string'),
});

export const updateProductWarehouseStockSchema = createProductWarehouseStockSchema
  .partial()
  .extend({
    id: z.string().uuid(),
  });

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type ProductQueryDto = z.infer<typeof productQuerySchema>;
export type ProductSearchDto = z.infer<typeof productSearchSchema>;
export type CreateProductWarehouseStockDto = z.infer<typeof createProductWarehouseStockSchema>;
export type UpdateProductWarehouseStockDto = z.infer<typeof updateProductWarehouseStockSchema>;
