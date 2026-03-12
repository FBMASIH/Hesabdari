# Requirement Checklist — Hesabdari

## A. Invoice Types

- [x] Sales invoice — schema + contract + service + controller
- [x] Purchase invoice — schema + contract + service + controller
- [x] Sales return — schema + contract + service + controller
- [x] Purchase return — schema + contract + service + controller
- [x] Proforma — schema + contract + service + controller
- [x] Party exclusivity (customer/vendor) — Zod discriminated union
- [x] Warehouse requirement (non-PROFORMA lines) — Zod superRefine
- [x] Invoice status transitions (DRAFT→CONFIRMED→CANCELLED) — service
- [x] Transactional create/update with lines — repository
- [x] Line number auto-assignment — repository
- [ ] Invoice total computation validation — partial (summed in service, not cross-verified against line totals)
- [ ] Unit tests for invoice logic — not yet

## B. Master Data

- [x] Currency CRUD (global) — full
- [x] Bank CRUD (global) — full
- [x] Expense CRUD (org-scoped) — full
- [x] BankAccount CRUD (org-scoped) — full
- [x] Cashbox CRUD (org-scoped) — full
- [x] Customer CRUD + search — full
- [x] Vendor CRUD + search — full
- [x] Warehouse CRUD — full
- [x] Product CRUD + search — full
- [x] ProductWarehouseStock upsert — full
- [ ] Seed data (IRR, Iranian banks) — not yet
- [ ] Unit tests for master data — not yet

## C. Opening Balances

- [x] Customer opening balance (one per customer per currency) — full
- [x] Vendor opening balance (one per vendor per currency) — full
- [x] Bank opening balance (multiple allowed) — full
- [x] Cashbox opening balance (multiple allowed) — full
- [x] Currency consistency (bank/cashbox) — service validation
- [ ] Unit tests for opening balance logic — not yet

## D. Cheques

- [x] Received cheque CRUD — full
- [x] Received cheque state machine (OPEN→DEPOSITED→CASHED/RETURNED/BOUNCED) — full
- [x] Paid cheque CRUD — full
- [x] Paid cheque state machine (OPEN→CLEARED/RETURNED) — full
- [x] Sayadi number uniqueness — service validation
- [x] Currency consistency (deposit bank, paid cheque bank) — service validation
- [ ] Unit tests for cheque state machines — not yet

## E. Infrastructure

- [x] Prisma schema (30 models, 9 enums) — complete
- [x] Prisma client generation — complete
- [x] Zod contracts (14 files) — complete
- [x] Full monorepo build — passing (8/8)
- [ ] Database migrations — blocked (no PostgreSQL)
- [ ] Seed data script — not yet
- [ ] Auth guards on business endpoints — not yet
- [ ] Global error filter (Zod/AppError → HTTP) — not yet
- [ ] BigInt JSON serialization — not yet
- [ ] Unit/integration test suite — not yet
- [ ] E2E test suite — not yet

## F. Deferred

- [ ] Per-record audit fields (createdByUserId/updatedByUserId) — deferred per D013
- [ ] Fractional quantities — deferred per D003
- [ ] Multi-currency UI — deferred per D001
- [ ] Reports module — empty scaffold
- [ ] Notifications module — empty scaffold
- [ ] Files/upload module — empty scaffold
- [ ] Frontend pages — intentionally deferred
