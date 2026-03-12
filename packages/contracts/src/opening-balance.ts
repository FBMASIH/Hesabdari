import { z } from 'zod';
import { paginationSchema } from './common.js';

const balanceTypeEnum = z.enum(['DEBIT', 'CREDIT']);

// Customer opening balance
export const createCustomerOpeningBalanceSchema = z.object({
  customerId: z.string().uuid(),
  currencyId: z.string().uuid(),
  amount: z.number().int().positive(),
  balanceType: balanceTypeEnum,
  description: z.string().max(500).optional(),
});

export const customerOpeningBalanceQuerySchema = paginationSchema.extend({
  customerId: z.string().uuid().optional(),
});

// Vendor opening balance
export const createVendorOpeningBalanceSchema = z.object({
  vendorId: z.string().uuid(),
  currencyId: z.string().uuid(),
  amount: z.number().int().positive(),
  balanceType: balanceTypeEnum,
  description: z.string().max(500).optional(),
});

export const vendorOpeningBalanceQuerySchema = paginationSchema.extend({
  vendorId: z.string().uuid().optional(),
});

// Bank opening balance
export const createBankOpeningBalanceSchema = z.object({
  bankAccountId: z.string().uuid(),
  currencyId: z.string().uuid(),
  amount: z.number().int().positive(),
  balanceDate: z.coerce.date().optional(),
  description: z.string().max(500).optional(),
});

export const bankOpeningBalanceQuerySchema = paginationSchema.extend({
  bankAccountId: z.string().uuid().optional(),
});

// Cashbox opening balance
export const createCashboxOpeningBalanceSchema = z.object({
  cashboxId: z.string().uuid(),
  currencyId: z.string().uuid(),
  amount: z.number().int().positive(),
  balanceDate: z.coerce.date().optional(),
  description: z.string().max(500).optional(),
});

export const cashboxOpeningBalanceQuerySchema = paginationSchema.extend({
  cashboxId: z.string().uuid().optional(),
});

export type CreateCustomerOpeningBalanceDto = z.infer<typeof createCustomerOpeningBalanceSchema>;
export type CustomerOpeningBalanceQueryDto = z.infer<typeof customerOpeningBalanceQuerySchema>;
export type CreateVendorOpeningBalanceDto = z.infer<typeof createVendorOpeningBalanceSchema>;
export type VendorOpeningBalanceQueryDto = z.infer<typeof vendorOpeningBalanceQuerySchema>;
export type CreateBankOpeningBalanceDto = z.infer<typeof createBankOpeningBalanceSchema>;
export type BankOpeningBalanceQueryDto = z.infer<typeof bankOpeningBalanceQuerySchema>;
export type CreateCashboxOpeningBalanceDto = z.infer<typeof createCashboxOpeningBalanceSchema>;
export type CashboxOpeningBalanceQueryDto = z.infer<typeof cashboxOpeningBalanceQuerySchema>;

export { balanceTypeEnum };
