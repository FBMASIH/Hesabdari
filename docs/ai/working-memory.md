# Working Memory — Hesabdari

**Last updated:** 2026-03-12

## Current Phase
Domain-first / backend-first implementation. Schema + contracts + backend modules complete. No migrations run yet (no live DB). Frontend is scaffolded but intentionally untouched.

## Project Truth
- **Type:** Enterprise Persian accounting platform — pnpm monorepo, modular monolith, clean architecture
- **Stack:** NestJS 11.1 + Fastify (API), Next.js 16.1 (Web), Prisma 7, PostgreSQL 18, Zod contracts
- **Build:** Turborepo, webpack for API (nest-cli), Turbopack for Web. Full build: 8/8 tasks pass.
- **DB package:** `"type": "module"` (ESM) — required for Prisma 7 generated code using `import.meta.url`

## Architecture Snapshot
```
apps/api/          NestJS backend (webpack builder)
apps/web/          Next.js 16.1 frontend (scaffolded, minimal)
packages/db/       Prisma 7 schema (30 models, 9 enums) + generated client
packages/contracts/ Zod schemas (14 files) — API boundary validation
packages/shared/   Shared types/utils
packages/ui/       Radix-based UI components (11)
packages/design-tokens/ Tailwind theme tokens
packages/api-client/    Typed HTTP client (stub)
packages/config/        TS/ESLint/Prettier configs
```

## Active Backend Modules (implemented)
| Module | Entities | Status |
|--------|----------|--------|
| identity | User, Session, Role, Permission | scaffolded (auth flow) |
| organizations | Organization, OrganizationMember | scaffolded (CRUD) |
| accounting | Account, Period, JournalEntry, Currency, Expense | full CRUD |
| customers | Customer, CustomerOpeningBalance | full CRUD + search + opening balances |
| vendors | Vendor, VendorOpeningBalance | full CRUD + search + opening balances |
| treasury | Bank, BankAccount, Cashbox, ReceivedCheque, PaidCheque, BankOpeningBalance, CashboxOpeningBalance | full CRUD + state machines |
| inventory | Warehouse, Product, ProductWarehouseStock | full CRUD + search + stock upsert |
| invoices | Invoice, InvoiceLine | full CRUD + transactional + status transitions |
| audit | AuditLog | scaffolded |
| reports | — | empty module |
| notifications | — | empty module |
| files | — | empty module |

## Current Priorities
1. No database migrations have been run (no PostgreSQL available during dev)
2. No unit/integration tests written for new modules yet
3. Frontend pages are scaffold-only — intentionally deferred
4. Seed data (currencies, banks) not yet implemented

## Active Constraints
- All money stored as BigInt in IRR (Rial). Toman display is presentation-only.
- Integer-only quantities (fractional deferred)
- Multi-currency schema exists but single-currency (IRR) default behavior
- Per-record audit fields (createdByUserId) deferred — AuditLog table provides event tracking
- No auth guards wired to business endpoints yet
