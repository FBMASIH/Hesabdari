import { describe, it, expect } from 'vitest';
import { assertPeriodOpen } from '../domain/rules/period.rule';
import { DomainError } from '../domain/errors/domain.error';

describe('Accounting Period Rules', () => {
  describe('assertPeriodOpen', () => {
    it('should not throw when period is OPEN', () => {
      expect(() => assertPeriodOpen('OPEN')).not.toThrow();
    });

    it('should throw DomainError when period is CLOSED', () => {
      expect(() => assertPeriodOpen('CLOSED')).toThrow(DomainError);
    });

    it('should throw with ACCOUNTING_PERIOD_CLOSED code when period is CLOSED', () => {
      try {
        assertPeriodOpen('CLOSED');
        // Should not reach here
        expect.unreachable('assertPeriodOpen should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(DomainError);
        expect((err as DomainError).code).toBe('ACCOUNTING_PERIOD_CLOSED');
      }
    });

    it('should include a descriptive message when period is CLOSED', () => {
      expect(() => assertPeriodOpen('CLOSED')).toThrow('closed');
    });
  });
});
