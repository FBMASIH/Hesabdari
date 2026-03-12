import { DomainError } from '@/platform/errors';

/**
 * Value object for monetary amounts stored as integer minor units (e.g. cents).
 * Avoids floating-point arithmetic for financial calculations.
 */
export class Money {
  private constructor(
    public readonly amount: bigint,
    public readonly currency: string,
  ) {}

  static fromMinorUnits(amount: bigint, currency: string): Money {
    return new Money(amount, currency);
  }

  static zero(currency: string): Money {
    return new Money(0n, currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  isZero(): boolean {
    return this.amount === 0n;
  }

  isPositive(): boolean {
    return this.amount > 0n;
  }

  isNegative(): boolean {
    return this.amount < 0n;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new DomainError(
        'CURRENCY_MISMATCH',
        `Cannot operate on different currencies: ${this.currency} vs ${other.currency}`,
      );
    }
  }
}
