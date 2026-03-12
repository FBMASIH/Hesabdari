# Working Memory — Hesabdari

**Last updated:** 2026-03-12 (Session 5)

## Current Phase

Backend stabilization complete. Runtime safety hardening done: BigInt serialization, global auth guard, structured error handling. 45 unit tests passing. Frontend scaffolded but untouched.

## Project Truth

- **Stack:** NestJS 11.1 + Fastify, Next.js 16.1, Prisma 7, PostgreSQL 18, Zod contracts
- **Build:** 8/8 tasks pass. Tests: 6 files, 45 tests all pass.
- **DB package:** ESM (`"type": "module"`), exports `PrismaClient` + `Prisma` namespace

## Architecture Snapshot

```
apps/api/          NestJS backend (webpack builder)
apps/web/          Next.js 16.1 frontend (scaffolded, minimal)
packages/db/       Prisma 7 schema (30 models, 9 enums) + generated client
packages/contracts/ Zod schemas (15 files)
packages/shared/   Shared types/utils
packages/ui/       Radix-based UI components (11)
packages/design-tokens/ Tailwind theme tokens
packages/api-client/    Typed HTTP client (stub)
packages/config/        TS/ESLint/Prettier configs
```

## Runtime Safety (new in Session 5)

- **BigInt serialization:** `BigIntSerializerInterceptor` — global, converts BigInt→number in all responses
- **Auth:** `JwtAuthGuard` registered as `APP_GUARD` — deny-by-default. Only `@Public()` endpoints skip auth.
- **Error handling:** `GlobalExceptionFilter` — ZodError→400, ApplicationError→statusCode, DomainError→422, HttpException→status, unknown→500. Consistent `{ error: { code, message, details? } }` shape.
- **Logging:** `LoggingInterceptor` — global, logs `METHOD URL - Xms` for every request.

## Active Backend Modules

| Module                                  | Status                                                              |
| --------------------------------------- | ------------------------------------------------------------------- |
| identity                                | Auth flow (JWT, sessions, register/login)                           |
| organizations                           | CRUD                                                                |
| accounting                              | Full CRUD (Account, Period, JournalEntry, Currency, Expense), typed |
| customers                               | Full CRUD + search + opening balances                               |
| vendors                                 | Full CRUD + search + opening balances                               |
| treasury                                | Full CRUD + state machines (cheques), typed                         |
| inventory                               | Full CRUD + stock upsert, typed                                     |
| invoices                                | Full CRUD + transactional + status transitions, typed               |
| audit / reports / notifications / files | Stubs                                                               |

## Public Endpoints

- `POST /api/v1/auth/register`, `/login`, `/refresh` — @Public()
- `GET /api/v1/health`, `/health/ready` — @Public()
- All other endpoints require JWT

## Current Priorities

1. Commit all changes (type-safety + runtime hardening + tests)
2. Database migrations (requires PostgreSQL)
3. Seed data (IRR currency, 22 Iranian banks)
4. Integration tests (service-level with mocked repos)
5. Organization membership validation in guards

## Active Constraints

- All money: BigInt in IRR, serialized as number in API responses
- Integer-only quantities
- No auth guards validate org membership yet (JWT auth only, no RBAC)
- Per-record audit fields deferred (D013)
