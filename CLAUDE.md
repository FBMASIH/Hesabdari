# Hesabdari — AI Development Guide

## Product

Hesabdari is an enterprise accounting platform for Persian-speaking users.
Web-first, with planned desktop (Tauri) and mobile (Expo) apps.
Multi-tenant, modular monolith with clean architecture.

## Stack

| Layer    | Technology                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------- |
| Frontend | Next.js 16, React 19, TypeScript 5.9, Tailwind 4, TanStack Query 5, Zustand 5, React Hook Form + Zod |
| Backend  | NestJS 11 + Fastify, PostgreSQL 18, Prisma 7, Valkey 8, RabbitMQ 4.2                                 |
| Monorepo | pnpm 10, Turborepo                                                                                   |
| Testing  | Vitest (unit), Playwright (E2E)                                                                      |
| CI       | GitHub Actions                                                                                       |

## Repository Map

```
apps/api/           — NestJS backend (12 feature modules + platform infrastructure)
apps/web/           — Next.js frontend (App Router, feature-sliced)
packages/db/         — Prisma schema, migrations, seeds
packages/ui/         — 11 shared React components (Radix + CVA)
packages/design-tokens/ — Single source of truth for UI tokens (theme.ts is canonical)
packages/contracts/  — Zod API schemas (shared between frontend and backend)
packages/shared/     — Shared TypeScript types and constants
packages/api-client/ — Typed HTTP client for frontend
packages/config/     — ESLint, TypeScript, Prettier shared configs
docs/                — Architecture, ADRs, runbooks, domain docs
```

## Commands

```bash
pnpm dev             # Start all apps in dev mode
pnpm build           # Build everything
pnpm typecheck       # TypeScript checking across all packages
pnpm lint            # ESLint across all packages
pnpm lint:fix        # Auto-fix lint issues
pnpm format          # Prettier format all files
pnpm format:check    # Check formatting without writing
pnpm test            # Run unit tests (Vitest)
pnpm test:e2e        # Run E2E tests (Playwright)
pnpm db:generate     # Generate Prisma client
pnpm db:migrate      # Run database migrations
pnpm db:seed         # Seed database
```

### Single-package commands

```bash
pnpm --filter @hesabdari/api test     # Test only the API
pnpm --filter @hesabdari/web build    # Build only the web app
pnpm --filter @hesabdari/db db:migrate # Run migrations
```

## Architecture Rules

### Backend Module Structure

Each of the 12 modules follows clean architecture:

```
modules/<name>/
  domain/
    entities/         — Core business objects
    value-objects/    — Immutable value types
    repositories/    — Repository interfaces (ports)
    rules/           — Business rule validators
  application/
    services/        — Use cases / orchestration
    dto/             — Data transfer objects
  infrastructure/
    repositories/    — Prisma implementations (adapters)
  presentation/
    http/controllers/ — REST endpoints
  tests/             — Module-specific tests
  <name>.module.ts   — NestJS module definition
```

**Dependency rule — NEVER violate:**

- `domain/` must NOT import from NestJS, Prisma, Express, Fastify, or any framework
- `presentation/` → `application/` → `domain/` (one-way)
- `infrastructure/` implements `domain/` interfaces
- Controllers must NEVER call Prisma directly

### Frontend Structure

```
src/
  app/              — Next.js App Router pages
    (auth)/         — Public routes (login, signup)
    (dashboard)/    — Protected routes
  features/         — Feature modules (auth, accounting, invoices, etc.)
  widgets/          — Composite UI (AppShell, Sidebar, Topbar)
  providers/        — React Context providers
  shared/           — Hooks, types, utils, config
```

## Domain Rules — NON-NEGOTIABLE

### Money

- Store ALL money in **Rial (IRR)** as **integer** (minor units, decimalPlaces=0)
- **NEVER** use `float`, `double`, `Decimal`, or `number` with decimals for persisted money
- Toman is **presentation-layer only** — divide by 10 for display, never store
- Use the `Money` value object in domain code
- Format with thousand separators in the UI only

### Accounting

- **Double-entry**: Every journal entry must have `sum(debits) === sum(credits)` — enforced in domain AND database
- **Immutable ledger**: Posted entries are NEVER modified — corrections via reversal entries only
- **Closed periods**: Reject ordinary writes to closed accounting periods
- **Idempotency**: External writes must carry idempotency keys
- **Audit trail**: All state changes to financial entities must be logged

### Multi-tenancy

- Every tenant-owned table has `organization_id`
- Every repository query MUST be scoped by `organization_id`
- Never expose data across tenants

### Dates

- Persian (Jalali/Shamsi) calendar in Persian UI — display concern only
- Store all dates as UTC timestamps in the database
- Use ISO 8601 in API request/response

## Coding Conventions

### TypeScript

- Strict mode always (`strict: true` in tsconfig)
- No `any` — use `unknown` and narrow
- Explicit return types on exported functions
- Barrel exports (`index.ts`) for each package/module

### Naming

- Files: `kebab-case.ts` / `kebab-case.tsx`
- Classes: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Database columns: `snake_case`
- API endpoints: `kebab-case` in URL paths

### Design System

- `packages/design-tokens/src/theme.ts` is the **single source of truth**
- Never hardcode colors, spacing, shadows, or typography in components
- Use CSS variables generated from tokens
- All UI components in `packages/ui/` — never duplicate

## Forbidden Shortcuts

- Do NOT use `any` type
- Do NOT use `!` non-null assertion unless truly safe
- Do NOT bypass ESLint with `// eslint-disable` without a comment explaining why
- Do NOT import from `node_modules` paths directly (use package names)
- Do NOT put business logic in controllers or React components
- Do NOT use `float` / `Decimal` for money storage
- Do NOT modify closed-period journal entries
- Do NOT commit `.env`, secrets, credentials, or API keys
- Do NOT use `git push --force` to main
- Do NOT skip pre-commit hooks with `--no-verify`
- Do NOT create migrations that cannot be rolled back
- Do NOT hardcode Toman values in storage or domain logic

## Before Committing

1. `pnpm typecheck` — must pass
2. `pnpm lint` — must pass
3. `pnpm test` — must pass
4. `pnpm format:check` — must pass
5. Verify no secrets in staged files
6. Use conventional commit format: `type(scope): subject`

## Commit Scopes

Apps: `api`, `web`, `desktop`, `mobile`
Packages: `ui`, `db`, `contracts`, `shared`, `api-client`, `design-tokens`, `config`
Modules: `identity`, `organizations`, `accounting`, `invoices`, `customers`, `vendors`, `inventory`, `treasury`, `reports`, `audit`, `notifications`, `files`
Infra: `ci`, `docker`, `deps`, `repo`, `docs`, `release`

## Key File Locations

| What                      | Where                                     |
| ------------------------- | ----------------------------------------- |
| Prisma schema             | `packages/db/prisma/schema.prisma`        |
| Design tokens (canonical) | `packages/design-tokens/src/theme.ts`     |
| API bootstrap             | `apps/api/src/main.ts`                    |
| API root module           | `apps/api/src/app.module.ts`              |
| API config                | `apps/api/src/config/app.config.ts`       |
| Domain errors             | `apps/api/src/platform/errors/`           |
| Frontend root layout      | `apps/web/src/app/layout.tsx`             |
| Frontend providers        | `apps/web/src/providers/`                 |
| CI pipeline               | `.github/workflows/ci.yml`                |
| Docker services           | `docker-compose.yml`                      |
| Project spec              | `docs/claude-code-web-accounting-spec.md` |

## Environment Variables

See `.env.example` for all required variables. Key ones:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Must be changed in production
- `NEXT_PUBLIC_API_URL` — API base URL for frontend
