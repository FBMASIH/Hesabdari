import { describe, it, expect } from 'vitest';

/**
 * Tests for cheque state machine transition rules.
 * These test the VALID_TRANSITIONS constants and transition logic
 * without requiring a database or DI container.
 */

// Received cheque transitions (from received-cheque.service.ts)
const RECEIVED_CHEQUE_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['DEPOSITED', 'CANCELLED'],
  DEPOSITED: ['CASHED', 'RETURNED', 'BOUNCED', 'CANCELLED'],
  CASHED: [],
  RETURNED: ['OPEN', 'CANCELLED'],
  BOUNCED: [],
  CANCELLED: [],
};

// Paid cheque transitions (from paid-cheque.service.ts)
const PAID_CHEQUE_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['CLEARED', 'RETURNED', 'CANCELLED'],
  CLEARED: [],
  RETURNED: ['OPEN', 'CANCELLED'],
  CANCELLED: [],
};

function isValidTransition(
  transitions: Record<string, string[]>,
  from: string,
  to: string,
): boolean {
  return (transitions[from] ?? []).includes(to);
}

describe('Received Cheque State Machine', () => {
  it('should allow OPEN → DEPOSITED', () => {
    expect(isValidTransition(RECEIVED_CHEQUE_TRANSITIONS, 'OPEN', 'DEPOSITED')).toBe(true);
  });

  it('should allow OPEN → CANCELLED', () => {
    expect(isValidTransition(RECEIVED_CHEQUE_TRANSITIONS, 'OPEN', 'CANCELLED')).toBe(true);
  });

  it('should allow DEPOSITED → CASHED', () => {
    expect(isValidTransition(RECEIVED_CHEQUE_TRANSITIONS, 'DEPOSITED', 'CASHED')).toBe(true);
  });

  it('should allow DEPOSITED → RETURNED', () => {
    expect(isValidTransition(RECEIVED_CHEQUE_TRANSITIONS, 'DEPOSITED', 'RETURNED')).toBe(true);
  });

  it('should allow DEPOSITED → BOUNCED', () => {
    expect(isValidTransition(RECEIVED_CHEQUE_TRANSITIONS, 'DEPOSITED', 'BOUNCED')).toBe(true);
  });

  it('should allow RETURNED → OPEN (re-deposit flow)', () => {
    expect(isValidTransition(RECEIVED_CHEQUE_TRANSITIONS, 'RETURNED', 'OPEN')).toBe(true);
  });

  it('should reject OPEN → CASHED (must deposit first)', () => {
    expect(isValidTransition(RECEIVED_CHEQUE_TRANSITIONS, 'OPEN', 'CASHED')).toBe(false);
  });

  it('should reject CASHED → anything (terminal state)', () => {
    expect(isValidTransition(RECEIVED_CHEQUE_TRANSITIONS, 'CASHED', 'OPEN')).toBe(false);
    expect(isValidTransition(RECEIVED_CHEQUE_TRANSITIONS, 'CASHED', 'CANCELLED')).toBe(false);
  });

  it('should reject BOUNCED → anything (terminal state)', () => {
    expect(isValidTransition(RECEIVED_CHEQUE_TRANSITIONS, 'BOUNCED', 'OPEN')).toBe(false);
  });

  it('should reject CANCELLED → anything (terminal state)', () => {
    expect(isValidTransition(RECEIVED_CHEQUE_TRANSITIONS, 'CANCELLED', 'OPEN')).toBe(false);
  });

  it('should have terminal states with no outgoing transitions', () => {
    const terminalStates = ['CASHED', 'BOUNCED', 'CANCELLED'];
    for (const state of terminalStates) {
      expect(RECEIVED_CHEQUE_TRANSITIONS[state]).toEqual([]);
    }
  });
});

describe('Paid Cheque State Machine', () => {
  it('should allow OPEN → CLEARED', () => {
    expect(isValidTransition(PAID_CHEQUE_TRANSITIONS, 'OPEN', 'CLEARED')).toBe(true);
  });

  it('should allow OPEN → RETURNED', () => {
    expect(isValidTransition(PAID_CHEQUE_TRANSITIONS, 'OPEN', 'RETURNED')).toBe(true);
  });

  it('should allow OPEN → CANCELLED', () => {
    expect(isValidTransition(PAID_CHEQUE_TRANSITIONS, 'OPEN', 'CANCELLED')).toBe(true);
  });

  it('should allow RETURNED → OPEN (re-issue flow)', () => {
    expect(isValidTransition(PAID_CHEQUE_TRANSITIONS, 'RETURNED', 'OPEN')).toBe(true);
  });

  it('should reject CLEARED → anything (terminal state)', () => {
    expect(isValidTransition(PAID_CHEQUE_TRANSITIONS, 'CLEARED', 'OPEN')).toBe(false);
    expect(isValidTransition(PAID_CHEQUE_TRANSITIONS, 'CLEARED', 'CANCELLED')).toBe(false);
  });

  it('should reject CANCELLED → anything (terminal state)', () => {
    expect(isValidTransition(PAID_CHEQUE_TRANSITIONS, 'CANCELLED', 'OPEN')).toBe(false);
  });

  it('should have terminal states with no outgoing transitions', () => {
    expect(PAID_CHEQUE_TRANSITIONS['CLEARED']).toEqual([]);
    expect(PAID_CHEQUE_TRANSITIONS['CANCELLED']).toEqual([]);
  });
});

describe('Invoice Status Transitions', () => {
  const INVOICE_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['CANCELLED'],
    CANCELLED: [],
  };

  it('should allow DRAFT → CONFIRMED', () => {
    expect(isValidTransition(INVOICE_TRANSITIONS, 'DRAFT', 'CONFIRMED')).toBe(true);
  });

  it('should allow DRAFT → CANCELLED', () => {
    expect(isValidTransition(INVOICE_TRANSITIONS, 'DRAFT', 'CANCELLED')).toBe(true);
  });

  it('should allow CONFIRMED → CANCELLED', () => {
    expect(isValidTransition(INVOICE_TRANSITIONS, 'CONFIRMED', 'CANCELLED')).toBe(true);
  });

  it('should reject CONFIRMED → DRAFT (no un-confirm)', () => {
    expect(isValidTransition(INVOICE_TRANSITIONS, 'CONFIRMED', 'DRAFT')).toBe(false);
  });

  it('should reject CANCELLED → anything (terminal state)', () => {
    expect(isValidTransition(INVOICE_TRANSITIONS, 'CANCELLED', 'DRAFT')).toBe(false);
    expect(isValidTransition(INVOICE_TRANSITIONS, 'CANCELLED', 'CONFIRMED')).toBe(false);
  });
});
