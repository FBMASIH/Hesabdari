import { describe, it, expect } from 'vitest';
import { Money } from '../domain/value-objects/money.vo';
import { DomainError } from '../domain/errors/domain.error';

describe('Money Value Object', () => {
  describe('fromMinorUnits', () => {
    it('should create a Money instance from BigInt amount', () => {
      const money = Money.fromMinorUnits(1250000n, 'IRR');
      expect(money.amount).toBe(1250000n);
      expect(money.currency).toBe('IRR');
    });

    it('should handle zero amount', () => {
      const money = Money.fromMinorUnits(0n, 'IRR');
      expect(money.amount).toBe(0n);
      expect(money.isZero()).toBe(true);
    });

    it('should handle very large amounts (beyond Number.MAX_SAFE_INTEGER)', () => {
      const largeAmount = 9_007_199_254_740_993n; // > Number.MAX_SAFE_INTEGER
      const money = Money.fromMinorUnits(largeAmount, 'IRR');
      expect(money.amount).toBe(largeAmount);
    });

    it('should handle negative amounts', () => {
      const money = Money.fromMinorUnits(-500n, 'IRR');
      expect(money.amount).toBe(-500n);
      expect(money.isNegative()).toBe(true);
    });
  });

  describe('zero', () => {
    it('should create a zero-amount Money instance', () => {
      const money = Money.zero('IRR');
      expect(money.amount).toBe(0n);
      expect(money.currency).toBe('IRR');
      expect(money.isZero()).toBe(true);
    });
  });

  describe('add', () => {
    it('should add two Money values with the same currency', () => {
      const a = Money.fromMinorUnits(1000n, 'IRR');
      const b = Money.fromMinorUnits(2500n, 'IRR');
      const result = a.add(b);
      expect(result.amount).toBe(3500n);
      expect(result.currency).toBe('IRR');
    });

    it('should throw on currency mismatch', () => {
      const a = Money.fromMinorUnits(1000n, 'IRR');
      const b = Money.fromMinorUnits(2500n, 'USD');
      expect(() => a.add(b)).toThrow(DomainError);
      expect(() => a.add(b)).toThrow('Cannot operate on different currencies');
    });
  });

  describe('subtract', () => {
    it('should subtract two Money values with the same currency', () => {
      const a = Money.fromMinorUnits(5000n, 'IRR');
      const b = Money.fromMinorUnits(2000n, 'IRR');
      const result = a.subtract(b);
      expect(result.amount).toBe(3000n);
    });

    it('should allow negative results', () => {
      const a = Money.fromMinorUnits(1000n, 'IRR');
      const b = Money.fromMinorUnits(3000n, 'IRR');
      const result = a.subtract(b);
      expect(result.amount).toBe(-2000n);
      expect(result.isNegative()).toBe(true);
    });

    it('should throw on currency mismatch', () => {
      const a = Money.fromMinorUnits(5000n, 'IRR');
      const b = Money.fromMinorUnits(2000n, 'USD');
      expect(() => a.subtract(b)).toThrow('Cannot operate on different currencies');
    });
  });

  describe('comparison methods', () => {
    it('isZero returns true only for zero amount', () => {
      expect(Money.fromMinorUnits(0n, 'IRR').isZero()).toBe(true);
      expect(Money.fromMinorUnits(1n, 'IRR').isZero()).toBe(false);
      expect(Money.fromMinorUnits(-1n, 'IRR').isZero()).toBe(false);
    });

    it('isPositive returns true only for positive amounts', () => {
      expect(Money.fromMinorUnits(100n, 'IRR').isPositive()).toBe(true);
      expect(Money.fromMinorUnits(0n, 'IRR').isPositive()).toBe(false);
      expect(Money.fromMinorUnits(-100n, 'IRR').isPositive()).toBe(false);
    });

    it('isNegative returns true only for negative amounts', () => {
      expect(Money.fromMinorUnits(-100n, 'IRR').isNegative()).toBe(true);
      expect(Money.fromMinorUnits(0n, 'IRR').isNegative()).toBe(false);
      expect(Money.fromMinorUnits(100n, 'IRR').isNegative()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same amount and currency', () => {
      const a = Money.fromMinorUnits(5000n, 'IRR');
      const b = Money.fromMinorUnits(5000n, 'IRR');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const a = Money.fromMinorUnits(5000n, 'IRR');
      const b = Money.fromMinorUnits(3000n, 'IRR');
      expect(a.equals(b)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const a = Money.fromMinorUnits(5000n, 'IRR');
      const b = Money.fromMinorUnits(5000n, 'USD');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('add should return a new instance without mutating the original', () => {
      const a = Money.fromMinorUnits(1000n, 'IRR');
      const b = Money.fromMinorUnits(2000n, 'IRR');
      const result = a.add(b);
      expect(a.amount).toBe(1000n);
      expect(b.amount).toBe(2000n);
      expect(result.amount).toBe(3000n);
    });

    it('subtract should return a new instance without mutating the original', () => {
      const a = Money.fromMinorUnits(5000n, 'IRR');
      const b = Money.fromMinorUnits(2000n, 'IRR');
      const result = a.subtract(b);
      expect(a.amount).toBe(5000n);
      expect(result.amount).toBe(3000n);
    });
  });
});
