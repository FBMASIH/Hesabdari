import { z } from 'zod';
import { paginationSchema } from './common.js';

const costingMethodEnum = z.enum(['FIFO', 'LIFO', 'AVERAGE']);

export const createProductSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  barcode: z.string().max(50).optional(),
  countingUnit: z.string().min(1).max(50).default('عدد'),
  majorUnit: z.string().max(50).optional(),
  minorUnit: z.string().max(50).optional(),
  quantityInMajorUnit: z.number().int().positive().optional(),
  salePrice: z.number().int().min(0).default(0),
  costingMethod: costingMethodEnum.default('FIFO'),
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
  purchasePrice: z.number().int().min(0),
  totalPrice: z.number().int().min(0),
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
