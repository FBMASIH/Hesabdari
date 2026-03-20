# Working Memory — Hesabdari

**Last updated:** 2026-03-20 (Session 7)

## Current Phase

Frontend architecture refactor complete. Server-side initial data fetch implemented across all list and edit pages. Optimistic mutations added. Architecture documented and frozen.

## Project Truth

- **Stack:** NestJS 11.1 + Fastify, Next.js 16.1, Prisma 7, PostgreSQL 18, Zod contracts
- **Build:** 8/8 tasks pass. Tests: 6 files, 45 tests all pass.
- **Routes:** 15 dynamic (server-fetch), 13 static (prerendered)

## Architecture Snapshot

```
apps/api/              NestJS backend (webpack builder)
apps/web/              Next.js 16.1 frontend (App Router, 29 pages)
packages/db/           Prisma 7 schema (30 models, 9 enums)
packages/contracts/    Zod schemas (18 files)
packages/shared/       Shared types/utils
packages/ui/           Radix-based UI components
packages/design-tokens/ Tailwind theme tokens
packages/api-client/   Typed HTTP client (used by both client and server)
packages/config/       TS/ESLint/Prettier configs
```

## Frontend Architecture (D020, frozen)

- **Server Components:** page.tsx files fetch initial data via `createServerClient()`, pass as props
- **Client Components:** all feature components (forms, lists, dropdowns, modals)
- **Auth:** cookies synced with localStorage in `useAuthStore`; server reads via `cookies()`
- **Data fetching:** TanStack Query for client cache/mutations; server-prefetch for first render
- **Optimistic mutations:** 9 hooks (8 deletes + 1 cancel)
- **Guide:** `docs/ai/frontend-architecture.md`

## Active Constraints

- All money: BigInt in IRR, serialized as string in API responses (D019)
- Auth: deny-by-default via APP_GUARD (D017), cookie-synced for server fetch (D020)
- Server prefetch: list page 1 + edit entity only. No dropdown/secondary data.
- Forms: Client Components only. Do not attempt server-rendered forms.

## Recent Changes

- Server-side sorting on all 11 list endpoints with Zod-validated field whitelists
- Journal entries endpoint now paginated with status/date filters

## Current Priorities

1. Database migrations (requires PostgreSQL)
2. Seed data (IRR currency, 22 Iranian banks)
3. Integration tests (service-level with mocked repos)
4. Reports / Notifications / Files module implementation
