import type { JournalLineEntity } from '../entities/journal-entry.entity';
import { DomainError } from '@/platform/errors';

/**
 * Domain rule: debits must equal credits in a journal entry.
 * This is a fundamental accounting invariant.
 */
export function assertJournalBalances(
  lines: Pick<JournalLineEntity, 'debitAmount' | 'creditAmount'>[],
): void {
  const totalDebits = lines.reduce((sum, line) => sum + line.debitAmount, 0n);
  const totalCredits = lines.reduce((sum, line) => sum + line.creditAmount, 0n);

  if (totalDebits !== totalCredits) {
    throw new DomainError(
      'JOURNAL_NOT_BALANCED',
      `Journal entry is not balanced. Debits: ${totalDebits}, Credits: ${totalCredits}`,
    );
  }
}

/**
 * Domain rule: a journal entry must have at least 2 lines.
 */
export function assertMinimumLines(lines: unknown[]): void {
  if (lines.length < 2) {
    throw new DomainError(
      'INSUFFICIENT_JOURNAL_LINES',
      'A journal entry must have at least 2 lines',
    );
  }
}
