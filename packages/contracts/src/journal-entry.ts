import { z } from 'zod';
import { paginationSchema } from './common.js';

const journalEntryStatusEnum = z.enum(['DRAFT', 'POSTED', 'REVERSED']);

const createJournalLineSchema = z.object({
  accountId: z.string().uuid(),
  description: z.string().max(500).optional(),
  debitAmount: z.string().regex(/^\d+$/, 'must be a non-negative integer string').default('0'),
  creditAmount: z.string().regex(/^\d+$/, 'must be a non-negative integer string').default('0'),
});

export const createJournalEntrySchema = z.object({
  entryNumber: z.string().min(1).max(50),
  date: z.coerce.date(),
  description: z.string().min(1).max(1000),
  periodId: z.string().uuid(),
  idempotencyKey: z.string().uuid().optional(),
  lines: z.array(createJournalLineSchema).min(2),
});

const JOURNAL_ENTRY_SORTABLE_FIELDS = [
  'entryNumber',
  'date',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const journalEntryQuerySchema = paginationSchema.extend({
  status: journalEntryStatusEnum.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortBy: z.enum(JOURNAL_ENTRY_SORTABLE_FIELDS).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const updateJournalEntrySchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date().optional(),
  description: z.string().min(1).max(1000).optional(),
  lines: z.array(createJournalLineSchema).min(2).optional(),
});

export type CreateJournalEntryDto = z.infer<typeof createJournalEntrySchema>;
export type UpdateJournalEntryDto = z.infer<typeof updateJournalEntrySchema>;
export type CreateJournalLineDto = z.infer<typeof createJournalLineSchema>;
export type JournalEntryQueryDto = z.infer<typeof journalEntryQuerySchema>;

export { journalEntryStatusEnum, createJournalLineSchema };
