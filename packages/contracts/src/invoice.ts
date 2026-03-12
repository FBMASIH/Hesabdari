import { z } from 'zod';
import { paginationSchema } from './common.js';

const documentTypeEnum = z.enum([
  'SALES',
  'PURCHASE',
  'SALES_RETURN',
  'PURCHASE_RETURN',
  'PROFORMA',
]);
const invoiceStatusEnum = z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']);

const createInvoiceLineSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid().optional(),
  description: z.string().max(500).optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().int().min(0),
  discount: z.number().int().min(0).default(0),
  tax: z.number().int().min(0).default(0),
  totalPrice: z.number().int().min(0),
});

// Base invoice schema without party fields — refined per document type
const baseInvoiceSchema = z.object({
  documentType: documentTypeEnum,
  invoiceNumber: z.string().min(1).max(50),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
  description: z.string().max(1000).optional(),
  currencyId: z.string().uuid(),
  lines: z.array(createInvoiceLineSchema).min(1),
});

// Sales-type invoices: customerId required, vendorId forbidden
const salesInvoiceSchema = baseInvoiceSchema.extend({
  documentType: z.enum(['SALES', 'SALES_RETURN', 'PROFORMA']),
  customerId: z.string().uuid(),
  vendorId: z.undefined().optional(),
});

// Purchase-type invoices: vendorId required, customerId forbidden
const purchaseInvoiceSchema = baseInvoiceSchema.extend({
  documentType: z.enum(['PURCHASE', 'PURCHASE_RETURN']),
  vendorId: z.string().uuid(),
  customerId: z.undefined().optional(),
});

export const createInvoiceSchema = z
  .discriminatedUnion('documentType', [
    salesInvoiceSchema.extend({ documentType: z.literal('SALES') }),
    salesInvoiceSchema.extend({ documentType: z.literal('SALES_RETURN') }),
    salesInvoiceSchema.extend({ documentType: z.literal('PROFORMA') }),
    purchaseInvoiceSchema.extend({ documentType: z.literal('PURCHASE') }),
    purchaseInvoiceSchema.extend({ documentType: z.literal('PURCHASE_RETURN') }),
  ])
  .superRefine((data, ctx) => {
    // Warehouse required for inventory-affecting documents
    if (data.documentType !== 'PROFORMA') {
      data.lines.forEach((line, i) => {
        if (!line.warehouseId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'warehouseId is required for inventory-affecting invoices',
            path: ['lines', i, 'warehouseId'],
          });
        }
      });
    }
  });

export const updateInvoiceSchema = z.object({
  id: z.string().uuid(),
  invoiceDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  description: z.string().max(1000).optional(),
  lines: z.array(createInvoiceLineSchema).min(1).optional(),
});

export const invoiceQuerySchema = paginationSchema.extend({
  type: documentTypeEnum.optional(),
  status: invoiceStatusEnum.optional(),
  customerId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export type CreateInvoiceDto = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceDto = z.infer<typeof updateInvoiceSchema>;
export type InvoiceQueryDto = z.infer<typeof invoiceQuerySchema>;
export type CreateInvoiceLineDto = z.infer<typeof createInvoiceLineSchema>;

export { documentTypeEnum, invoiceStatusEnum, createInvoiceLineSchema };
