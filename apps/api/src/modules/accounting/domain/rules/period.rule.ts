import type { AccountingPeriodStatus } from '@hesabdari/db';
import { DomainError } from '@/platform/errors';

/**
 * Domain rule: closed periods must not accept ordinary writes.
 */
export function assertPeriodOpen(status: AccountingPeriodStatus): void {
  if (status === 'CLOSED') {
    throw new DomainError(
      'ACCOUNTING_PERIOD_CLOSED',
      'The accounting period is closed. No further entries can be posted.',
    );
  }
}
