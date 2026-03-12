# Hesabdari — Engineering Operating Standard

## Product

Hesabdari is an enterprise accounting platform for Persian-speaking users.
Web-first, with planned desktop (Tauri) and mobile (Expo) apps.
Multi-tenant, modular monolith with clean architecture.
Finance/accounting domain with immutable ledger and audit requirements.
AI-assisted development with memory files in `docs/ai/`.

---

## Stack

| Layer    | Technology                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------- |
| Frontend | Next.js 16, React 19, TypeScript 5.9, Tailwind 4, TanStack Query 5, Zustand 5, React Hook Form + Zod |
| Backend  | NestJS 11 + Fastify, PostgreSQL 18, Prisma 7, Valkey 8, RabbitMQ 4.2                                 |
| Monorepo | pnpm 10, Turborepo                                                                                   |
| Testing  | Vitest (unit), Playwright (E2E)                                                                      |
| CI       | GitHub Actions                                                                                       |

---

## Repository Map

```
apps/api/              — NestJS backend (12 feature modules + platform infrastructure)
apps/web/              — Next.js frontend (App Router, feature-sliced)
packages/db/           — Prisma schema, migrations, seeds (ESM, exports Prisma namespace)
packages/ui/           — 11 shared React components (Radix + CVA)
packages/design-tokens/ — Single source of truth for UI tokens (theme.ts is canonical)
packages/contracts/    — Zod API schemas (shared between frontend and backend)
packages/shared/       — Shared TypeScript types and constants
packages/api-client/   — Typed HTTP client for frontend
packages/config/       — Shared configs
  config/eslint/       — @hesabdari/config-eslint
  config/prettier/     — @hesabdari/config-prettier
  config/typescript/   — @hesabdari/config-typescript (base, nestjs, nextjs, library)
docs/                  — Architecture, ADRs, runbooks, domain docs
docs/ai/               — AI memory system (working-memory, decisions, conventions, progress)
```

---

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
pnpm clean           # Remove build artifacts (dist, .next, .turbo)
```

### Single-package commands

```bash
pnpm --filter @hesabdari/api test     # Test only the API
pnpm --filter @hesabdari/web build    # Build only the web app
pnpm --filter @hesabdari/db db:migrate # Run migrations
```

---

## AI Agent Operating Protocol

Every AI agent working in this repo MUST follow this protocol. No exceptions.

### Before touching code

1. **Read `docs/ai/working-memory.md`** — understand current project state.
2. **Read the relevant source files** — never guess field names, types, or contracts.
3. **Read `packages/db/prisma/schema.prisma`** when working on any persistence layer.
4. **Read the relevant contract** in `packages/contracts/src/` when working on any API layer.

### While working

1. Make **small, coherent changes** — one logical concern per commit.
2. **Never invent field names** — every field must trace to the Prisma schema or an explicit design decision.
3. **Never guess contracts** — read the Zod schema, then implement against it.
4. Run the **minimum relevant verification** after each change:
   - Backend change → `pnpm --filter @hesabdari/api build`
   - Contract change → `pnpm --filter @hesabdari/contracts build && pnpm --filter @hesabdari/api build`
   - Frontend change → `pnpm --filter @hesabdari/web build`
   - Schema change → `pnpm db:generate && pnpm build`

### After completing a task

1. Run **full verification**: `pnpm build` (must pass 8/8).
2. Update **`docs/ai/working-memory.md`** with current state.
3. Append architectural decisions to **`docs/ai/decision-log.md`** (format: `D0XX`).
4. Append shipped work to **`docs/ai/progress-log.md`**.
5. Update **`docs/ai/requirement-checklist.md`** when scope or status changes.
6. Compact/clean AI docs regularly — remove duplication, keep each file under 200 lines.
7. Summarize: **what changed, what was tested, what remains**.

### Failure handling

- If a build fails, **fix the root cause** — never suppress errors.
- If a test fails, **investigate** — never delete or skip the test.
- If a schema-contract mismatch is found, **fix the contract** (schema is truth).
- If unsure about a design decision, **document the question** in `docs/ai/open-questions.md` and ask.
- **Hook / guardrail failures:** If a policy-enforcing hook, pre-write hook, or validation hook fails, the failure MUST be investigated and logged. MUST NOT assume the guardrail executed successfully just because the file changed. Hook failures affecting safety, auditability, or policy enforcement **block task completion** until resolved or explicitly waived with documented rationale.

---

## Schema-First Rule

**`packages/db/prisma/schema.prisma` is the single source of truth for all persistence fields.**

### Always

- [ ] Contracts, DTOs, services, repositories, seeds, and tests MUST use the exact field names from the Prisma schema.
- [ ] After any schema change: run `pnpm db:generate`, then update every dependent layer (contracts → services → repositories → controllers → tests).
- [ ] Repository implementations MUST compile against generated Prisma types (`Prisma.XxxCreateInput`, `Prisma.XxxWhereInput`, etc.) — never use `any`.
- [ ] Import `Prisma` namespace from `@hesabdari/db` for type-safe repository code.

### Never

- MUST NOT invent alternate field names (e.g., `salePrice` when schema says `salePrice1`).
- MUST NOT add fields to contracts that do not exist in the schema.
- MUST NOT put domain attributes on a model that doesn't have them in the schema.

---

## Architecture Rules

### Backend Module Structure

Each of the 12 modules follows clean architecture (8 implemented, 4 stubs — audit, files, notifications, reports):

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

- `domain/` MUST NOT import from NestJS, Prisma, Express, Fastify, or any framework.
- `presentation/` → `application/` → `domain/` (one-way).
- `infrastructure/` implements `domain/` interfaces.
- Controllers MUST NOT call Prisma directly.
- Controllers MUST validate input with Zod (`schema.parse(body)`), then delegate to services.

### Frontend Structure (Next.js App Router)

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

**Frontend rules:**

- **Server Components by default.** Use Client Components (`'use client'`) only for interactivity, browser APIs, or client-side state.
- **No business logic in components.** Validation → Zod. State → Zustand.
- **Data fetching:**
  - **Server-side reads** are the default read path. Server Components may use `fetch`, server-side API clients, or other server-safe async I/O.
  - **TanStack Query** is for client-side interactivity: background refresh, optimistic UX, pagination, and mutation-related cache management.
  - Financial or tenant-sensitive reads MUST declare caching behavior intentionally. Highly sensitive reads (balances, ledger state, cheque status) SHOULD use `{ cache: 'no-store' }` or `dynamic = 'force-dynamic'` unless there is an explicit, reviewed caching decision.
- **Mutations** go through `api-client` → backend. MUST NOT mutate server state from a Server Component directly.
- **Client-side caching:** TanStack Query with stale-while-revalidate. Invalidate on mutation success. MUST NOT cache financial data longer than the session.
- **Accessibility:** All interactive elements MUST be keyboard-navigable. Use `aria-*` attributes. Test with screen readers.
- **RTL layout:** `dir="rtl"` on root. All layout MUST work bidirectionally.
- **Persian typography:** Use IRANSans or Vazirmatn. MUST NOT use Latin-only fonts for Persian text.
- **Jalali calendar:** All date pickers and date displays MUST use Jalali (Shamsi) calendar. Conversion happens at the presentation boundary only.
- **Standard patterns:**
  - Tables: sortable headers, pagination, empty state, loading skeleton.
  - Forms: React Hook Form + Zod resolver, field-level errors, submit-level error banner.
  - Errors: toast for transient, inline for validation, full-page for fatal.
  - Loading: skeleton for layout, spinner for actions.
  - Empty states: illustration + call-to-action.

---

## Domain Rules — NON-NEGOTIABLE

### Money

- MUST store ALL money as **`BigInt`** in **Rial (IRR)**, integer-only (`decimalPlaces=0`).
- MUST NOT use `float`, `double`, `Decimal`, or `number` with decimals for persisted money.
- **API boundary:** Money MUST be sent over JSON as an **integer string** (e.g., `"1250000"`), not a floating-point number. Parse with Zod (`z.string().regex(/^\d+$/)` or `z.coerce.bigint()`), then convert to `BigInt` in the service layer. MUST reject decimal strings, formatted strings, and non-integer input.
  ```
  Valid:   { "amount": "1250000" }
  Invalid: { "amount": 1250000 }      ← number loses precision for large values
  Invalid: { "amount": "1250000.50" } ← decimal
  Invalid: { "amount": "۱٬۲۵۰٬۰۰۰" } ← formatted
  ```
- **Toman is presentation-layer only** — divide by 10 for display, never store.
- MUST use the `Money` value object in domain code.
- Format with Persian thousand separators (`۱۲٬۳۴۵٬۶۷۸ ﷼`) in the UI only.
- Multi-currency: schema supports it via `currencyId`. Default currency is IRR. All amounts in a transaction MUST share the same `currencyId` — enforce in service layer.

### Accounting

- **Double-entry**: Every journal entry MUST have `sum(debits) === sum(credits)` — enforced in domain rules AND at database level.
- **Immutable ledger**: Posted entries are NEVER modified. Corrections via reversal entries only.
- **Closed periods**: MUST reject ordinary writes to closed accounting periods. Only system-level corrections allowed.
- **Idempotency**: External writes MUST carry idempotency keys. Duplicate keys → return existing result, never double-post.
- **Audit trail**: All state changes to financial entities MUST be logged to `AuditLog`.
- **No silent failures**: Any accounting write that fails MUST raise an explicit error. MUST NOT swallow exceptions around journal entries, invoices, or cheques.
- **State machines**: Invoice status, cheque status transitions defined as `Record<Status, Status[]>`. MUST reject invalid transitions with `ApplicationError`.

### Multi-tenancy

- Every tenant-owned table MUST have `organization_id`.
- Every repository query MUST be scoped by `organization_id` — no exceptions.
- MUST NOT expose data across tenants.
- MUST NOT trust client-provided `organizationId` in the request body — derive from authenticated session + URL parameter, then validate membership.

### Date and Money Modeling

**Storage:**

- **Timestamps** (`createdAt`, `updatedAt`, `postedAt`, `closedAt`): UTC, `@default(now())` or `@updatedAt`.
- **Business dates** (`date`, `invoiceDate`, `dueDate`, `startDate`, `endDate`): stored as `DateTime @db.Date` (date-only, no timezone). These represent the business calendar date, not a point in time.
- API request/response: ISO 8601 format (`YYYY-MM-DD` for dates, full ISO for timestamps).

**Display:**

- Persian (Jalali/Shamsi) calendar in Persian UI — conversion at the presentation boundary only.
- MUST NOT store Jalali dates in the database.
- MUST NOT convert business dates to UTC — they are calendar dates, not instants.

---

## Security & Authorization

### Authentication & Authorization

- **Deny-by-default.** Every endpoint MUST be protected unless explicitly marked `@Public()`.
- **Organization scoping + role/capability checks.** Every request MUST:
  1. Authenticate the user (JWT).
  2. Verify the user is a member of the requested organization.
  3. Check the user's role has the required permission for the action.
- MUST NOT trust client-provided tenant context. The `organizationId` in the URL path is validated against the user's memberships. Body-level `organizationId` is ignored.

### Secrets

- MUST NOT commit `.env`, credentials, API keys, or private keys.
- `JWT_SECRET` MUST be rotated on any suspected compromise.
- MUST use environment variables for all secrets. Document required variables in `.env.example`.
- Secrets in CI: MUST use GitHub Actions secrets, never inline in workflow files.
- MUST NOT log secrets, tokens, or credentials at any log level.

### Transport & Headers

- HTTPS-only in production.
- MUST set `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
- Cookies: `HttpOnly`, `Secure`, `SameSite=Strict` for session tokens.
- CORS: whitelist specific origins. MUST NOT use `*` in production.

### File Uploads (when files module is implemented)

- MUST validate MIME type server-side (never trust `Content-Type` header alone).
- MUST enforce maximum file size.
- SHOULD scan for malware if handling user-uploaded files.
- MUST store outside the webroot. Serve via signed URLs with expiration.

### PII & Logging

- MUST NOT log passwords, tokens, full credit card numbers, or national IDs.
- MUST mask sensitive fields in structured logs (show last 4 characters max).
- MUST minimize PII in error responses — return error codes, not internal details.

---

## Supply Chain & CI/CD Security

### Dependency Management

- MUST run `pnpm audit` in CI on every build. Block deployment on critical/high vulnerabilities without an explicit, time-boxed exception.
- MUST use exact lockfile (`pnpm-lock.yaml`) for deterministic installs. CI MUST run `pnpm install --frozen-lockfile`.
- Dependency updates: review changelogs, run full test suite, merge as a standalone `chore(deps):` commit. MUST NOT bundle dependency updates with feature work.
- SHOULD generate SBOM (Software Bill of Materials) for every releasable build. Store as a CI artifact.

### CI Pipeline Security

- MUST enable secret scanning in CI. Block merges that introduce secrets.
- MUST NOT store secrets in workflow files, Dockerfiles, or source code.
- MUST protect `main` branch: require PR reviews, passing CI, and no force-push.
- Migrations MUST be reviewed by a human before merge. CI MUST NOT auto-apply migrations to production.
- Release approvals: production deploys MUST require explicit approval (GitHub environment protection rules or equivalent).
- SHOULD track build provenance (signed commits, artifact checksums) where tooling supports it.

### Non-negotiable

- **MUST NOT bypass security gates for convenience.** If a security check blocks a deploy, fix the issue. Never skip, disable, or work around security gates.

---

## Observability & Auditability

### Structured Logging

- MUST use `pino` with JSON output in production, `pino-pretty` in development.
- Every log entry MUST include: `requestId`, `organizationId` (if scoped), `userId` (if authenticated), `timestamp`, `level`.
- MUST use `LoggerService` from `@/platform/logging/`. MUST NOT use `console.log` in application code.

### Tracing & Metrics

- MUST propagate `requestId` (and eventually OpenTelemetry `traceId`) through all service calls.
- MUST instrument: request duration, error rate, database query time, queue message processing time.
- OpenTelemetry-compatible: when adding instrumentation, MUST use OTel-compatible APIs so future integration is seamless.

### Audit Events

- Financial actions (journal post, invoice confirm/cancel, cheque status change, period close) MUST write to `AuditLog`.
- Audit schema: `{ userId, organizationId, action, entityType, entityId, before, after, timestamp, requestId }`.
- Audit logs are append-only. MUST NOT delete or modify audit records.

### Error Taxonomy

| Error                   | HTTP | When                                                                              |
| ----------------------- | ---- | --------------------------------------------------------------------------------- |
| `NotFoundError`         | 404  | Entity does not exist or is not accessible to the tenant                          |
| `ConflictError`         | 409  | Duplicate unique key, concurrent modification                                     |
| `ApplicationError`      | 422  | Domain rule violation (invalid state transition, closed period, balance mismatch) |
| `UnauthorizedException` | 401  | Missing or invalid authentication                                                 |
| `ForbiddenException`    | 403  | Authenticated but lacks permission                                                |
| `ZodError`              | 400  | Request validation failure                                                        |
| Unhandled               | 500  | Log full stack server-side, return generic message to client                      |

---

## Reliability, SLOs & Incident Management

### Service Level Indicators & Objectives

| SLI                          | Measurement                                                | SLO target                                 |
| ---------------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| **Login / session validity** | Successful authentication requests / total attempts        | 99.9% success rate, p95 < 500ms            |
| **Invoice creation**         | Successful invoice creates / total attempts                | 99.95% success rate, p95 < 1s              |
| **Ledger posting**           | Journal entries posted without error / total post attempts | 99.99% success rate (zero silent failures) |
| **Report generation**        | Reports rendered within timeout / total requests           | 99.5% success rate, p95 < 5s               |
| **Sync / import jobs**       | Jobs completed without error / total jobs dispatched       | 99.5% success rate                         |

- MUST define error budgets per SLI. When the error budget is exhausted, freeze feature work and prioritize reliability.
- MUST NOT relax ledger-posting SLO below 99.99%. Financial data integrity is non-negotiable.

### Incident Severity Levels

| Severity | Definition                                                                 | Response time        | Update cadence |
| -------- | -------------------------------------------------------------------------- | -------------------- | -------------- |
| **SEV0** | Data corruption, financial integrity breach, complete outage               | Immediate (< 15 min) | Every 15 min   |
| **SEV1** | Major feature unavailable (invoicing, journal posting, auth), data at risk | < 30 min             | Every 30 min   |
| **SEV2** | Degraded performance, non-critical feature broken, workaround exists       | < 2 hours            | Every 2 hours  |
| **SEV3** | Minor bug, cosmetic issue, no data risk                                    | Next business day    | On resolution  |

### Incident Command

- Every SEV0/SEV1 MUST have a designated incident commander.
- Commander responsibilities: coordinate response, communicate status, log decisions with timestamps, escalate if unresolved within SLA.
- All significant decisions during an incident MUST be logged in the incident channel/document with rationale.
- MUST NOT make undocumented production changes during an incident.

### Postmortems

- Every SEV0/SEV1 incident MUST have a blameless postmortem within 3 business days.
- Postmortem MUST include: timeline, root cause, contributing factors, impact assessment, action items with owners and due dates.
- MUST track recurring incidents. If the same root cause appears twice, escalate to architectural review.
- Regression links: every postmortem action item that involves code MUST reference a test that prevents recurrence.

---

## Backup, Restore & Recovery

### RPO / RTO Targets

| Tier       | RPO (max data loss) | RTO (max downtime) | Applies to                                                     |
| ---------- | ------------------- | ------------------ | -------------------------------------------------------------- |
| **Tier 1** | 1 hour              | 2 hours            | PostgreSQL (financial data, audit logs)                        |
| **Tier 2** | 24 hours            | 4 hours            | Valkey (cache — rebuildable), RabbitMQ (messages — replayable) |
| **Tier 3** | 7 days              | 24 hours           | File storage, non-critical blobs                               |

### Backup Rules

- PostgreSQL: MUST enable continuous WAL archiving with point-in-time recovery (PITR). Minimum daily base backups.
- All backups MUST be encrypted at rest (AES-256 or equivalent).
- Backup access MUST follow least-privilege: only designated operators can trigger restores.
- Backup storage MUST be in a separate failure domain (different availability zone or region).
- MUST NOT store backups on the same volume as production data.

### Retention & Legal Hold

- Default retention: 90 days for daily backups, 1 year for monthly snapshots.
- Retention periods for fiscal and compliance backups are compliance-controlled and must be confirmed by legal/accounting counsel.
- Legal-hold: when notified of litigation or audit, MUST suspend deletion of all relevant backups until hold is released.

### Restore Drills

- MUST perform a full restore drill at least once per quarter.
- Drill procedure:
  1. Restore backup to an isolated environment (never production).
  2. Verify data integrity: row counts, checksum of financial tables, audit log continuity.
  3. Run fiscal-period integrity checks: `sum(debits) === sum(credits)` for every period in the restored data.
  4. Verify that restored data follows the same security/audit controls as production (tenant isolation, access controls).
  5. Document results, time to restore, and any issues in `docs/runbooks/restore-drill-log.md`.
- If a drill fails, treat as SEV2 and fix before next production release.

### Post-Restore Verification

- [ ] All tables restored with expected row counts.
- [ ] `sum(debits) === sum(credits)` for every accounting period.
- [ ] Audit log append-only integrity verified: expected row counts, primary key / sequence continuity where applicable. If tamper-evidence (hash-chain / checksum) is implemented, verify chain integrity.
- [ ] Tenant isolation verified (spot-check queries with wrong `organizationId` return empty).
- [ ] Application connects and serves requests against restored data.
- [ ] Restored data follows the same security and audit controls as production.
- [ ] No secrets or credentials were exposed during the restore process.

---

## Operational Feature Flags & Safe Degradation

### Kill-Switch Rules

- Every risky feature and every third-party integration MUST have a kill-switch flag that can disable it without a deploy.
- Kill-switch flags MUST be checkable at runtime (e.g., environment variable, Valkey key, or database flag).
- When a kill-switch is activated, the system MUST return a clear error (`503 Service Temporarily Unavailable` or equivalent) — not silently drop data.

### Read-Only Fallback

- When data integrity is uncertain (e.g., after a partial restore, during a migration, or when a third-party dependency is down), finance-sensitive write paths MUST degrade to read-only mode.
- Read-only mode: display existing data, reject all writes with a clear message ("System is in read-only mode for data integrity protection").
- MUST log every activation/deactivation of read-only mode with reason and operator.

### Flag Hygiene

Every operational flag MUST have:

| Attribute                    | Required                      |
| ---------------------------- | ----------------------------- |
| **Owner**                    | Name or team responsible      |
| **Purpose**                  | One-sentence description      |
| **Expiry / removal plan**    | Date or condition for removal |
| **Default state**            | On or off                     |
| **Tested degraded behavior** | Yes — verified in staging     |

- Flags without an owner or expiry MUST be cleaned up within 30 days of their creation.
- Degraded-mode behavior MUST be tested in staging before the flag is deployed to production.

---

## Testing Strategy

### Required Test Layers

| Layer                        | Tool            | What to test                                                                   | When required                   |
| ---------------------------- | --------------- | ------------------------------------------------------------------------------ | ------------------------------- |
| **Unit**                     | Vitest          | Domain entities, value objects, business rules, state machines                 | Every domain change             |
| **Integration**              | Vitest + Prisma | Services with real database, repository queries, transaction boundaries        | Every service/repo change       |
| **Contract**                 | Vitest          | Zod schemas parse valid input, reject invalid input, match Prisma types        | Every contract change           |
| **E2E**                      | Playwright      | Critical user flows (login, create invoice, post journal, cheque lifecycle)    | Before release                  |
| **Tenant isolation**         | Vitest          | Queries never return cross-tenant data, even with malformed input              | Every repository change         |
| **Idempotency**              | Vitest          | Duplicate idempotency keys return same result, no double-posting               | Journal entry, invoice creation |
| **Concurrency**              | Vitest          | Concurrent writes don't corrupt state (optimistic locking, unique constraints) | Financial write paths           |
| **Migration**                | CI              | Migrations apply cleanly to empty DB and to production-like DB                 | Every migration                 |
| **Accounting invariants**    | Vitest          | `sum(debits) === sum(credits)` after every operation, closed period rejection  | Every accounting change         |
| **Regression**               | Vitest          | Every bug fix MUST include a test that reproduces the bug                      | Every bug fix                   |
| **Feature flag degradation** | Vitest          | Kill-switch activation produces correct fallback behavior                      | Every new flag                  |

### Test naming convention

```
describe('InvoiceService')
  it('should reject confirming a CANCELLED invoice')
  it('should enforce currency consistency between invoice and lines')
```

---

## Database, Messaging & Release Rules

### Transaction Boundaries

- **Atomic financial writes.** Invoice creation (header + lines), journal posting (entry + status), cheque status changes — MUST be wrapped in `prisma.$transaction()`.
- **No cross-service transactions.** If two services need atomicity, extract to a single service or use the outbox pattern.
- **Keep transactions short.** MUST NOT make external API calls or publish messages inside a transaction.

### Messaging (RabbitMQ)

- **Outbox pattern for reliability.** When a database write must trigger a message:
  1. Write the business entity AND an outbox record in the same transaction.
  2. A background worker reads the outbox and publishes to RabbitMQ.
  3. Mark the outbox record as published.
- **Idempotent consumers.** Every consumer MUST handle duplicate messages gracefully.
- **Dead-letter queue.** Failed messages go to DLQ after 3 retries. MUST alert on DLQ growth.

### Migration Policy

- Every migration MUST be tested against an empty database and a production-like database in CI.
- **Prefer additive migrations.** Add columns, tables, indexes. Avoid dropping or renaming in the same release.
- **Multi-step for breaking changes:**
  1. Release N: add new column (nullable or with default).
  2. Release N+1: backfill data, update application code.
  3. Release N+2: add constraints, remove old column.
- **Forward-fix over rollback.** If a migration fails in production, fix forward with a corrective migration. Rolling back data migrations is dangerous in a financial system.
- MUST NOT modify a migration that has been applied to any environment. Create a new migration instead.
- Migrations MUST be reviewed by a human before merge.

### Seed Data

- `packages/db/prisma/seed.ts` MUST be idempotent (safe to run multiple times).
- Required seeds: IRR currency, 22 Iranian banks, system permissions, default roles.
- Seeds MUST NOT depend on external services or APIs.

### Deployment Order

1. Run migrations.
2. Run seeds (idempotent).
3. Deploy API.
4. Deploy Web.
5. Smoke test critical paths (login, invoice create, journal post).

---

## Coding Conventions

### TypeScript

- Strict mode always (`strict: true` in tsconfig).
- **No `any`** — use `unknown` and narrow. Import `Prisma` namespace for repository types.
- Explicit return types on exported functions.
- **Exports:** Each package has one `index.ts` barrel export. Modules MUST NOT re-export sub-modules. MUST NOT create deep barrel chains that cause circular imports. Only export what is consumed externally.

### Naming

| What                | Convention                                   | Example                  |
| ------------------- | -------------------------------------------- | ------------------------ |
| Files               | `kebab-case.ts` / `kebab-case.tsx`           | `paid-cheque.service.ts` |
| Classes             | `PascalCase`                                 | `PaidChequeService`      |
| Functions/variables | `camelCase`                                  | `findByOrganization`     |
| Constants           | `UPPER_SNAKE_CASE`                           | `VALID_TRANSITIONS`      |
| Database columns    | `snake_case`                                 | `organization_id`        |
| API URL paths       | `kebab-case`                                 | `/bank-accounts`         |
| Enums               | `PascalCase` name, `UPPER_SNAKE_CASE` values | `ChequeStatus.DEPOSITED` |

### Design System

- `packages/design-tokens/src/theme.ts` is the **single source of truth**.
- MUST NOT hardcode colors, spacing, shadows, or typography in components.
- MUST use CSS variables generated from tokens.
- All UI components in `packages/ui/` — MUST NOT duplicate across apps.

---

## Forbidden Shortcuts

These rules exist because violations have caused real bugs in this project.

| Rule                                                           | Why                                         |
| -------------------------------------------------------------- | ------------------------------------------- |
| MUST NOT use `any` type                                        | Masked schema-contract misalignments (D014) |
| MUST NOT use `!` non-null assertion (unless provably safe)     | Hides null pointer bugs                     |
| MUST NOT use `// eslint-disable` without an explaining comment | Silences real warnings                      |
| MUST NOT import from `node_modules` paths directly             | Breaks monorepo resolution                  |
| MUST NOT put business logic in controllers or React components | Violates clean architecture                 |
| MUST NOT use `float` / `Decimal` for money storage             | Financial precision loss                    |
| MUST NOT modify posted journal entries                         | Accounting law violation                    |
| MUST NOT commit `.env`, secrets, credentials                   | Security breach                             |
| MUST NOT `git push --force` to main                            | Destroys team history                       |
| MUST NOT use `--no-verify` on commits                          | Bypasses lint/format checks                 |
| MUST NOT hardcode Toman values in storage or domain            | IRR is storage unit                         |
| MUST NOT invent field names not in Prisma schema               | Schema-contract misalignment (D015)         |
| MUST NOT use `console.log` in application code                 | Use structured logger                       |
| MUST NOT expose cross-tenant data                              | Multi-tenancy violation                     |
| MUST NOT bypass security gates for convenience                 | Supply-chain and CI/CD integrity            |

---

## Before Committing

1. `pnpm build` — MUST pass (8/8 packages).
2. `pnpm typecheck` — MUST pass.
3. `pnpm lint` — MUST pass.
4. `pnpm test` — MUST pass.
5. `pnpm format:check` — MUST pass.
6. Verify no secrets in staged files.
7. Use conventional commit format: `type(scope): subject`.

### Commit Scopes

Apps: `api`, `web`, `desktop`, `mobile`
Packages: `ui`, `db`, `contracts`, `shared`, `api-client`, `design-tokens`, `config`
Modules: `identity`, `organizations`, `accounting`, `invoices`, `customers`, `vendors`, `inventory`, `treasury`, `reports`, `audit`, `notifications`, `files`
Infra: `ci`, `docker`, `deps`, `repo`, `docs`, `release`

---

## Offline & Cross-Platform Strategy

Desktop (Tauri) and mobile (Expo) apps are planned. These rules apply when they are implemented.

### Sync Ownership

- **Server is the single source of truth** for all financial data.
- Clients may cache data locally for read performance and limited offline access.
- All writes MUST be confirmed by the server before being treated as committed.

### Conflict Resolution

- **Last-write-wins** for non-financial master data (customer name, vendor address).
- **Server-rejects-conflicts** for financial data (invoices, journal entries, cheques). If the server state has changed since the client fetched, reject and require re-fetch.
- MUST NOT auto-merge financial data conflicts.

### Offline-safe Actions

| Action                     | Offline | Why                                            |
| -------------------------- | ------- | ---------------------------------------------- |
| Browse cached data         | Yes     | Read-only, no consistency risk                 |
| Draft invoice (local only) | Yes     | Not committed until synced                     |
| Post journal entry         | No      | Requires double-entry validation + idempotency |
| Change cheque status       | No      | State machine must be authoritative            |
| Create/edit master data    | Queue   | Sync on reconnect, server validates            |

### Eventual Consistency

- Financial totals, balances, and reports MUST NOT be computed from stale offline data.
- MUST display a clear "offline" indicator when the client cannot reach the server.
- Queue offline writes and replay on reconnect with idempotency keys.

---

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
| Product spec              | `docs/claude-code-web-accounting-spec.md` |
| AI working memory         | `docs/ai/working-memory.md`               |
| AI decision log           | `docs/ai/decision-log.md`                 |
| AI conventions            | `docs/ai/conventions.md`                  |
| AI progress log           | `docs/ai/progress-log.md`                 |
| AI requirement checklist  | `docs/ai/requirement-checklist.md`        |

---

## Implementation Status

| Module        | Status      | Controllers | Services | Repositories |
| ------------- | ----------- | ----------- | -------- | ------------ |
| identity      | Implemented | 1           | 1        | 2            |
| organizations | Implemented | 1           | 1        | 1            |
| accounting    | Implemented | 5           | 5        | 5            |
| customers     | Implemented | 2           | 2        | 2            |
| vendors       | Implemented | 2           | 2        | 2            |
| inventory     | Implemented | 2           | 2        | 3            |
| invoices      | Implemented | 1           | 1        | 1            |
| treasury      | Implemented | 7           | 7        | 7            |
| audit         | Stub        | 0           | 1        | 1            |
| reports       | Stub        | 0           | 0        | 0            |
| notifications | Stub        | 0           | 0        | 0            |
| files         | Stub        | 0           | 0        | 0            |

---

## Environment Variables

See `.env.example` for all required variables. Key ones:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Must be changed in production, rotated on compromise
- `NEXT_PUBLIC_API_URL` — API base URL for frontend
- `NODE_ENV` — `development` | `production` | `test`
- `RABBITMQ_URL` — RabbitMQ connection string
- `VALKEY_URL` — Valkey (Redis-compatible) connection string

---

## Definition of Done

Every completed task MUST satisfy ALL of the following:

- [ ] Code updated and compiling (`pnpm build` passes 8/8).
- [ ] `docs/ai/working-memory.md` updated with current state.
- [ ] `docs/ai/progress-log.md` updated with what was shipped.
- [ ] Relevant tests passing (or written if new functionality).
- [ ] No `any` types introduced.
- [ ] No architecture violations (dependency direction, clean architecture layers).
- [ ] No tenant data leaks (every query scoped by `organizationId`).
- [ ] No accounting invariant regressions (`sum(debits) === sum(credits)`).
- [ ] No schema-contract misalignments.
- [ ] Concise changelog entry in `docs/ai/change-log.md`.
- [ ] Commit message follows `type(scope): subject` convention.

---

## Release Readiness Checklist

Before any production release:

- [ ] All CI checks green on the release branch.
- [ ] `pnpm build` passes 8/8 locally.
- [ ] `pnpm test` — all unit and integration tests pass.
- [ ] `pnpm test:e2e` — all critical-path E2E tests pass.
- [ ] No unresolved SEV0/SEV1 incidents.
- [ ] Error budget not exhausted for any SLI.
- [ ] All migrations reviewed by a human and tested against production-like DB.
- [ ] Seeds idempotent and verified.
- [ ] No secrets in source code (`pnpm audit` + secret scan clean).
- [ ] Dependency vulnerabilities: zero critical, zero high (or explicitly excepted with time-box).
- [ ] Feature flags: all new flags have owner, purpose, expiry, and tested degraded behavior.
- [ ] Deployment order documented and followed (migrations → seeds → API → Web → smoke test).
- [ ] Release remediation plan documented: application deploys may be rolled back if safe; database migrations are forward-fixed (not reversed) unless a pre-reviewed exceptional procedure exists; read-only mode is the default safety action when data integrity is uncertain.
- [ ] Changelog published.

---

## Production Incident Checklist

When a SEV0/SEV1 incident is declared:

- [ ] Incident commander designated.
- [ ] Communication channel opened (Slack/Teams/Discord — whatever is configured).
- [ ] Initial assessment: scope, impact, data integrity risk.
- [ ] If financial data integrity is at risk: activate read-only mode immediately.
- [ ] Status update sent within response-time SLA.
- [ ] All decisions logged with timestamps and rationale.
- [ ] Fix applied and verified in staging before production.
- [ ] Production fix deployed and smoke-tested.
- [ ] Read-only mode deactivated (if activated), with verification.
- [ ] All-clear communicated to stakeholders.
- [ ] Postmortem scheduled within 3 business days.
- [ ] Postmortem completed with: timeline, root cause, action items (with owners and due dates).
- [ ] Regression test written and merged.
- [ ] `docs/ai/decision-log.md` updated if architectural changes resulted.

---

## Restore Drill Checklist

Quarterly restore drill procedure:

- [ ] Select backup to restore (most recent daily or PITR target).
- [ ] Provision isolated restore environment (MUST NOT touch production).
- [ ] Restore PostgreSQL backup to isolated environment.
- [ ] Verify table row counts match expected values.
- [ ] Run fiscal-period integrity check: `sum(debits) === sum(credits)` for every period.
- [ ] Verify audit log append-only integrity (primary key/sequence continuity, hash-chain if implemented).
- [ ] Verify tenant isolation (spot-check: query with wrong `organizationId` returns empty).
- [ ] Start application against restored database and verify it serves requests.
- [ ] Verify no secrets or credentials were exposed during restore.
- [ ] Measure time to restore. Compare against RTO target.
- [ ] Document results in `docs/runbooks/restore-drill-log.md`.
- [ ] If drill failed: open SEV2, fix before next production release.
- [ ] Tear down isolated environment.
