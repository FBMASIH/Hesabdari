# Progress Log — Hesabdari

## Completed

### Phase 0: Scaffold (2026-03-11)
- 247 files scaffolded across 10 phases
- All module boundaries, platform infrastructure, design tokens, UI components, Docker, CI, docs
- Both apps build and run (API hangs at DB connect — expected, no PostgreSQL)
- Next.js serves on localhost:3000

### Phase 1: Schema + Contracts + Backend (2026-03-12)
- **Schema:** Prisma schema rewritten with 30 models, 9 enums, all relations, indexes, unique constraints
- **Prisma generate:** Client generated successfully
- **DB exports:** Updated with all new types and enums
- **Contracts:** 12 new Zod contract files (currency, bank, bank-account, cashbox, expense, warehouse, product, customer, vendor, invoice, opening-balance, cheque)
- **Backend modules:** 6 modules fully implemented (accounting+currency+expense, customers, vendors, treasury, inventory, invoices)
- **Opening balances:** 4 types implemented (customer, vendor, bank, cashbox) with currency consistency validation
- **Cheques:** Received and paid cheques with full state machine transitions
- **Invoices:** Transactional create/update, discriminated union validation, status transitions
- **Build:** Full monorepo 8/8 tasks pass (6 packages + API + Web)

### File counts (Phase 1)
- Repositories: 17 new
- Services: 14 new
- Controllers: 14 new
- Contracts: 12 new + 1 updated
- Module registrations: 5 updated
- ~65 files total

## In Progress
- Nothing actively in progress

## Remaining
1. Database migrations (requires PostgreSQL)
2. Seed data (IRR currency, Iranian banks)
3. Unit/integration tests for all new modules
4. Auth guards on business endpoints
5. Error filter (Zod/ApplicationError → HTTP responses)
6. Frontend pages (intentionally deferred)
7. Reports module implementation
8. Notifications module implementation
9. Files/upload module implementation
10. Per-record audit fields (createdByUserId)

## Last Build Result
```
pnpm run build — 8 successful, 8 total, 4 cached
API: webpack compiled successfully
Web: 11 static pages generated
```
