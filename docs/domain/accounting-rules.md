# Accounting Rules

## Double-Entry Bookkeeping

Every financial transaction is recorded as a journal entry with two or more lines.

**Fundamental invariant:**

```
sum(debit amounts) === sum(credit amounts)
```

This is enforced at three levels:

1. **Domain**: `JournalBalancingRule` validates before persistence
2. **Application**: Service layer rejects unbalanced entries
3. **Database**: CHECK constraint on `journal_entries` table

### Journal Entry Lifecycle

```
DRAFT → POSTED → (REVERSED)
```

- **DRAFT**: Being composed. Can be edited freely. Not yet in the ledger.
- **POSTED**: Committed to the ledger. Immutable. Affects account balances.
- **REVERSED**: A posted entry that has been reversed by a new correcting entry.

**Rule:** A POSTED entry is NEVER modified. To correct an error, create a reversal entry that negates the original, then create a new correct entry.

## Chart of Accounts

Accounts are organized hierarchically:

```
Assets (1xxx)
├── Current Assets (11xx)
│   ├── Cash (1101)
│   ├── Bank Accounts (1102)
│   └── Accounts Receivable (1103)
├── Fixed Assets (12xx)
Liabilities (2xxx)
├── Current Liabilities (21xx)
│   ├── Accounts Payable (2101)
Equity (3xxx)
Revenue (4xxx)
Expenses (5xxx)
```

Account properties:

- `code`: Hierarchical numeric code
- `type`: ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
- `parent_id`: Reference to parent account (nullable for root accounts)
- `is_detail`: Only detail accounts (leaves) can appear in journal lines
- Normal balance: Assets/Expenses are debit-normal; Liabilities/Equity/Revenue are credit-normal

## Accounting Periods

Periods define fiscal time boundaries (typically Shamsi year quarters or months).

States:

- **OPEN**: Accepts new journal entries
- **CLOSED**: Rejects ordinary journal entries (only admin adjustments allowed)
- **LOCKED**: No modifications at all

**Rule:** Closing a period is irreversible in normal operation. Only a system admin can reopen a closed period, and this must be logged in the audit trail.

## Invoices and Financial Documents

Invoice types:

- Sales Invoice
- Purchase Invoice
- Sales Return (credit note)
- Purchase Return (debit note)
- Proforma Invoice (no accounting effect)

Each invoice (except proforma) generates a journal entry on posting:

| Invoice Type    | Debit               | Credit              |
| --------------- | ------------------- | ------------------- |
| Sales           | Accounts Receivable | Revenue             |
| Purchase        | Expense/Inventory   | Accounts Payable    |
| Sales Return    | Revenue             | Accounts Receivable |
| Purchase Return | Accounts Payable    | Expense/Inventory   |

## Treasury

### Bank Accounts

- Linked to a bank (from master data)
- Track balance as running total from journal entries
- Opening balance recorded as a journal entry

### Cashboxes

- Physical cash locations
- Same balance tracking as bank accounts

### Cheques (Received & Paid)

Cheques have their own lifecycle:

**Received Cheques:**

```
RECEIVED → DEPOSITED → CLEARED / BOUNCED
                     → ENDORSED (transferred to another party)
```

**Paid Cheques:**

```
ISSUED → CLEARED / CANCELLED
```

Each status transition generates a journal entry.

## Opening Balances

When starting a new fiscal period or migrating from another system:

- Opening balances are recorded as journal entries against an "Opening Balance Equity" account
- Each entity (customer, vendor, bank account, cashbox) can have opening balances
- Opening balance entries are tagged with a special document type

## Audit Trail

All mutations to financial entities produce an `AuditLog` entry:

- `entity_type`: Which table was affected
- `entity_id`: Which record
- `action`: CREATE, UPDATE, DELETE, STATUS_CHANGE
- `old_values`: JSON snapshot before change
- `new_values`: JSON snapshot after change
- `user_id`: Who made the change
- `timestamp`: When (UTC)

Audit logs are append-only. They are never modified or deleted.
