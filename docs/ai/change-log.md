# Change Log — Hesabdari

## 2026-03-20 (Session 8) — Server-side sorting for all list endpoints

### Contracts (packages/contracts/src/)

- Added `sortOrderSchema` and `createSortableQuerySchema` helper to `common.ts`
- Added `sortBy` / `sortOrder` fields with per-entity whitelists to all 11 query schemas:
  - `customerQuerySchema` — sortable by: code, name, createdAt, updatedAt, creditLimit, isActive
  - `vendorQuerySchema` — same fields
  - `invoiceQuerySchema` — sortable by: invoiceNumber, invoiceDate, dueDate, totalAmount, status, documentType, createdAt, updatedAt
  - `journalEntryQuerySchema` — sortable by: entryNumber, date, status, createdAt, updatedAt
  - `accountQuerySchema` (new) — sortable by: code, name, type, createdAt, updatedAt, isActive
  - `bankAccountQuerySchema` — sortable by: code, name, accountNumber, createdAt, updatedAt, isActive
  - `cashboxQuerySchema` — sortable by: code, name, createdAt, updatedAt, isActive
  - `receivedChequeQuerySchema` — sortable by: chequeNumber, amount, date, dueDate, status, createdAt, updatedAt
  - `paidChequeQuerySchema` — same fields
  - `productQuerySchema` — sortable by: code, name, createdAt, updatedAt, salePrice1, isActive
  - `warehouseQuerySchema` — sortable by: code, name, createdAt, updatedAt, costingMethod, isActive

### Controllers (apps/api/src/modules/\*/presentation/http/controllers/)

- Accounts: added `@Query()` param, imports `accountQuerySchema`, passes parsed query to service
- Journal Entries: added `@Query()` param, imports `journalEntryQuerySchema`, passes parsed query to service
- All other controllers already parsed query schemas; no controller changes needed beyond accounts and journal entries

### Services (apps/api/src/modules/\*/application/services/)

- All 11 services now pass `sortBy` and `sortOrder` from query DTO to repository

### Repositories (apps/api/src/modules/\*/infrastructure/repositories/)

- All 11 repositories now accept `sortBy?` and `sortOrder?` in their opts
- `orderBy` computed dynamically: `{ [opts.sortBy ?? default]: opts.sortOrder ?? defaultOrder }`
- Journal entry repository upgraded: now supports pagination, status/date filters, and sort (was previously returning all entries without pagination)

### Files touched: 33

- 11 contract files (1 new schema `accountQuerySchema`, 10 updated query schemas)
- 11 controllers (2 modified: accounts, journal-entries)
- 11 services (all modified)
- 11 repositories (all modified)

### Build verification

- `pnpm build` — 8/8 successful
- `pnpm typecheck` — 14/14 clean

---

## 2026-03-12 (Session 5) — Runtime safety hardening + tests

### BigInt serialization (OQ-006 resolved)

- Created `platform/interceptors/bigint-serializer.interceptor.ts` — recursive BigInt→number conversion
- Registered globally in `main.ts`
- 7 unit tests covering nested objects, arrays, dates, primitives, realistic Prisma shapes

### Auth guard (OQ-004 resolved)

- Registered `JwtAuthGuard` as `APP_GUARD` in `app.module.ts` — deny-by-default
- Added `@Public()` to `HealthController` (health + readiness endpoints)
- Auth endpoints already had `@Public()` — no changes needed

### Global error filter (OQ-005 resolved)

- Rewrote `platform/filters/global-exception.filter.ts`:
  - Added ZodError handling (400, VALIDATION_ERROR, issues as details)
  - Fixed `Record<string, any>` → `Record<string, unknown>`
  - Extracted `resolve()` method for cleaner flow
  - Added typed `ErrorResponse` interface
- Registered globally in `main.ts`
- 9 unit tests covering all error types + consistency

### Logging interceptor

- Fixed `Observable<any>` → `Observable<unknown>` in return type
- Registered globally in `main.ts`

### State machine tests

- Created `treasury/tests/cheque-state-machines.spec.ts` — 23 tests
  - Received cheque: valid transitions, terminal states, rejection of invalid paths
  - Paid cheque: valid transitions, terminal states
  - Invoice status: DRAFT→CONFIRMED→CANCELLED, rejection of reversal

### Pre-existing test fix

- Fixed `journal-balancing.spec.ts`: matched on error message text, not error code

### Files touched

- New: 3 (bigint interceptor, bigint tests, cheque tests, filter tests)
- Modified: 6 (main.ts, app.module.ts, health controller, exception filter, logging interceptor, interceptors index, journal-balancing test)

---

## 2026-03-12 (Session 4) — Type safety + schema alignment

- Removed `any` from all repos/services/platform → Prisma typed inputs
- Product: salePrice→salePrice1/2/3, Warehouse: address→costingMethod
- New `account.ts` contract, DB `Prisma` namespace export
- 21 files, build 8/8

---

## 2026-03-12 (Sessions 1-3) — Initial scaffold + backend implementation

- 247 scaffolded files, 30 Prisma models, 14 contracts, 65+ backend files
- 6 modules fully implemented, memory system bootstrapped
