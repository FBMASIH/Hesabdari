import { z } from 'zod';
import { paginationSchema } from './common.js';

const chequeStatusEnum = z.enum([
  'OPEN',
  'DEPOSITED',
  'CASHED',
  'RETURNED',
  'BOUNCED',
  'CANCELLED',
]);
const paidChequeStatusEnum = z.enum(['OPEN', 'CLEARED', 'RETURNED', 'CANCELLED']);

// Received cheque — schema: customerId required, date (not issueDate), no bankId/branch/drawerName
export const createReceivedChequeSchema = z.object({
  chequeNumber: z.string().min(1).max(50),
  sayadiNumber: z.string().max(50).optional(),
  amount: z.string().regex(/^\d+$/, 'must be a positive integer string'),
  currencyId: z.string().uuid(),
  customerId: z.string().uuid(),
  date: z.coerce.date(),
  dueDate: z.coerce.date(),
  description: z.string().max(500).optional(),
});

export const updateReceivedChequeSchema = createReceivedChequeSchema.partial().extend({
  id: z.string().uuid(),
});

export const receivedChequeStatusSchema = z
  .object({
    status: chequeStatusEnum,
    depositBankAccountId: z.string().uuid().optional(),
  })
  .refine((data) => data.status !== 'DEPOSITED' || data.depositBankAccountId != null, {
    message: 'depositBankAccountId is required when status is DEPOSITED',
    path: ['depositBankAccountId'],
  });

const RECEIVED_CHEQUE_SORTABLE_FIELDS = [
  'chequeNumber',
  'amount',
  'date',
  'dueDate',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const receivedChequeQuerySchema = paginationSchema.extend({
  status: chequeStatusEnum.optional(),
  customerId: z.string().uuid().optional(),
  fromDueDate: z.coerce.date().optional(),
  toDueDate: z.coerce.date().optional(),
  sortBy: z.enum(RECEIVED_CHEQUE_SORTABLE_FIELDS).default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Paid cheque — schema: date (not issueDate), no payeeName
export const createPaidChequeSchema = z.object({
  chequeNumber: z.string().min(1).max(50),
  sayadiNumber: z.string().max(50).optional(),
  amount: z.string().regex(/^\d+$/, 'must be a positive integer string'),
  currencyId: z.string().uuid(),
  bankAccountId: z.string().uuid(),
  vendorId: z.string().uuid().optional(),
  date: z.coerce.date(),
  dueDate: z.coerce.date(),
  description: z.string().max(500).optional(),
});

export const updatePaidChequeSchema = createPaidChequeSchema.partial().extend({
  id: z.string().uuid(),
});

export const paidChequeStatusSchema = z.object({
  status: paidChequeStatusEnum,
});

const PAID_CHEQUE_SORTABLE_FIELDS = [
  'chequeNumber',
  'amount',
  'date',
  'dueDate',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const paidChequeQuerySchema = paginationSchema.extend({
  status: paidChequeStatusEnum.optional(),
  vendorId: z.string().uuid().optional(),
  bankAccountId: z.string().uuid().optional(),
  fromDueDate: z.coerce.date().optional(),
  toDueDate: z.coerce.date().optional(),
  sortBy: z.enum(PAID_CHEQUE_SORTABLE_FIELDS).default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateReceivedChequeDto = z.infer<typeof createReceivedChequeSchema>;
export type UpdateReceivedChequeDto = z.infer<typeof updateReceivedChequeSchema>;
export type ReceivedChequeStatusDto = z.infer<typeof receivedChequeStatusSchema>;
export type ReceivedChequeQueryDto = z.infer<typeof receivedChequeQuerySchema>;
export type CreatePaidChequeDto = z.infer<typeof createPaidChequeSchema>;
export type UpdatePaidChequeDto = z.infer<typeof updatePaidChequeSchema>;
export type PaidChequeStatusDto = z.infer<typeof paidChequeStatusSchema>;
export type PaidChequeQueryDto = z.infer<typeof paidChequeQuerySchema>;

export { chequeStatusEnum, paidChequeStatusEnum };
