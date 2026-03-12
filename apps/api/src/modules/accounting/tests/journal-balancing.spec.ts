import { describe, it, expect } from 'vitest';
import { assertJournalBalances, assertMinimumLines } from '../domain/rules/journal-balancing.rule';

describe('Journal Balancing Rules', () => {
  it('should pass when debits equal credits', () => {
    const lines = [
      { debitAmount: 10000n, creditAmount: 0n },
      { debitAmount: 0n, creditAmount: 10000n },
    ];
    expect(() => assertJournalBalances(lines)).not.toThrow();
  });

  it('should throw when debits do not equal credits', () => {
    const lines = [
      { debitAmount: 10000n, creditAmount: 0n },
      { debitAmount: 0n, creditAmount: 5000n },
    ];
    expect(() => assertJournalBalances(lines)).toThrow('not balanced');
  });

  it('should throw when fewer than 2 lines', () => {
    expect(() => assertMinimumLines([{}])).toThrow('at least 2 lines');
  });

  it('should pass with 2 or more lines', () => {
    expect(() => assertMinimumLines([{}, {}])).not.toThrow();
  });
});
