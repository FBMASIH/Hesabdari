type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'REVERSED';

export interface JournalEntryEntity {
  id: string;
  organizationId: string;
  periodId: string;
  baseCurrencyId: string;
  entryNumber: string;
  date: Date;
  description: string;
  status: JournalEntryStatus;
  postedAt: Date | null;
  postedBy: string | null;
  reversalOfId: string | null;
  idempotencyKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalLineEntity {
  id: string;
  journalEntryId: string;
  accountId: string;
  currencyId: string;
  description: string | null;
  debitAmount: bigint;
  creditAmount: bigint;
  exchangeRate: { toString(): string }; // Prisma Decimal — use .toString() for operations
  baseCurrencyDebitAmount: bigint;
  baseCurrencyCreditAmount: bigint;
  createdAt: Date;
}
