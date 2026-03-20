type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'REVERSED';

export interface JournalEntryEntity {
  id: string;
  organizationId: string;
  periodId: string;
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
  description: string | null;
  debitAmount: bigint;
  creditAmount: bigint;
  createdAt: Date;
}
