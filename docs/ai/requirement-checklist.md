# Requirement Checklist — Hesabdari

## A. Invoice Types

- [x] All 5 invoice types (Sales, Purchase, Returns, Proforma) — schema + contract + service + controller
- [x] Party exclusivity, warehouse requirement, status transitions, transactional lines
- [ ] Invoice total cross-verification against line totals — partial
- [ ] Unit tests for invoice service logic — not yet (state machine covered)

## B. Master Data

- [x] Currency, Bank, Expense, BankAccount, Cashbox, Customer, Vendor, Warehouse, Product CRUD — all full
- [x] ProductWarehouseStock upsert, Account CRUD + typed contract — full
- [ ] Seed data (IRR, 22 banks) — not yet (OQ-007)
- [ ] Unit tests for master data services — not yet

## C. Opening Balances

- [x] Customer/Vendor (one per entity per currency), Bank/Cashbox (multiple) — full
- [x] Currency consistency — service validation
- [ ] Unit tests — not yet

## D. Cheques

- [x] Received + Paid cheque CRUD + state machines — full, typed
- [x] Sayadi uniqueness, currency consistency — service validation
- [x] State machine unit tests — 23 tests passing

## E. Infrastructure

- [x] Prisma schema (30 models, 9 enums)
- [x] Zod contracts (15 files)
- [x] Full build (8/8)
- [x] Type safety — no `any` in backend (D014)
- [x] BigInt serialization — global interceptor (D016)
- [x] Auth — deny-by-default APP_GUARD (D017)
- [x] Error handling — global filter with ZodError, consistent shape (D018)
- [x] Unit tests — 45 passing (6 files)
- [ ] Database migrations — blocked (no PostgreSQL)
- [ ] Seed data script — not yet
- [ ] Org membership validation in auth — not yet (OQ-009)
- [ ] Integration tests — not yet
- [ ] E2E tests — not yet

## F. Deferred

- [ ] Per-record audit fields (D013)
- [ ] Fractional quantities (D003)
- [ ] Multi-currency UI (D001)
- [ ] Reports / Notifications / Files modules
- [ ] Frontend pages
