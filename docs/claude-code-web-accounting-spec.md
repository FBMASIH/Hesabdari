# Claude Code Master Specification — Enterprise Web Accounting Platform

## Status

Authoritative implementation specification.

## Purpose

This document defines the default technical architecture, technology stack, folder structure, design-system strategy, backend boundaries, frontend boundaries, operational rules, and implementation constraints for an enterprise-grade web accounting platform.

This specification is intended to be used as the primary implementation reference for Claude Code.

## Instruction Priority

When implementing the system:

1. Follow this document as the default source of truth.
2. Do not replace core architectural decisions with ad-hoc alternatives.
3. Do not introduce additional frameworks unless they solve a real architectural need.
4. Do not switch stack layers for convenience.
5. Do not collapse domain boundaries.
6. Do not bypass validation, typing, or test rules.
7. If a change is necessary, propose it as an ADR before applying it.

---

# 1. Target System

Build a web-first accounting platform with these properties:

- enterprise-grade maintainability
- modular and long-lived architecture
- high correctness for financial operations
- excellent developer experience
- clean boundaries between UI, application logic, domain logic, and infrastructure
- scalable backend without premature microservice fragmentation
- fully typed frontend-backend integration
- design system controlled from a single source of truth
- production-ready CI/CD, testing, observability, and security baseline

This phase covers **web frontend + web backend only**.

---

# 2. Final Stack Decision

## 2.1 Frontend

Use:

- **Next.js 16.1.x**
- **React 19.2.x**
- **TypeScript 5.9.x**
- **Tailwind CSS 4.1.x**
- **TanStack Query 5.x**
- **Zustand 5.x**
- **Zod**
- **React Hook Form**
- **Radix UI primitives**
- **Storybook 10.2.x**
- **OpenAPI-generated typed API client**

## 2.2 Backend

Use:

- **Node.js 24 LTS**
- **NestJS 11.1.x**
- **Fastify adapter**
- **TypeScript 5.9.x**
- **PostgreSQL 18.x**
- **Prisma 7.x** for general persistence and migrations
- **Raw SQL where necessary for financial-critical queries**
- **Valkey 8.x** as cache / rate-limit / short-lived coordination layer
- **RabbitMQ 4.2.x** for async jobs and background workflows
- **OpenAPI 3.2** as the primary contract standard

## 2.3 Tooling

Use:

- **pnpm 10.x** workspaces
- **ESLint**
- **Prettier**
- **Vitest** for frontend/unit libraries
- **Jest or Vitest** for backend unit/integration, but standardize on one test runner per layer
- **Playwright** for E2E
- **Docker**
- **GitHub Actions**

---

# 3. Core Architecture Decision

## 3.1 Architectural Style

Use:

- **Clean Architecture**
- **DDD-lite / practical bounded contexts**
- **Modular Monolith**

Do **not** start with microservices.

## 3.2 Why Modular Monolith First

This system must optimize for:

- speed of development
- correctness
- shared domain model consistency
- transaction safety
- lower operational complexity
- easier refactoring early in product life

Microservices are not the correct default for a new accounting platform because they introduce:

- distributed transaction complexity
- duplicated domain logic
- more infrastructure overhead
- harder local development
- harder testing
- harder schema evolution

## 3.3 Decomposition Strategy

Use one deployable backend application with strict internal module boundaries.

Each module must behave like an internal product area with:

- its own domain model
- its own application services
- its own repositories
- its own DTOs / contracts
- its own tests
- its own events

Modules communicate through:

- explicit application service calls
- domain events
- integration events where necessary

No module may directly manipulate another module’s database tables without going through its formal application boundary.

---

# 4. Backend Architecture

## 4.1 Backend High-Level Shape

Use a layered modular NestJS backend.

```text
apps/api
  src/
    main.ts
    bootstrap/
    config/
    platform/
    modules/
      identity/
      organizations/
      accounting/
      invoices/
      customers/
      vendors/
      inventory/
      treasury/
      reports/
      audit/
      notifications/
      files/
```

## 4.2 Internal Layering per Module

Every domain module must use this internal structure:

```text
modules/accounting/
  domain/
    entities/
    value-objects/
    enums/
    services/
    events/
    rules/
    repositories/
  application/
    commands/
    queries/
    handlers/
    dto/
    mappers/
    ports/
  infrastructure/
    persistence/
    repositories/
    prisma/
    subscribers/
    jobs/
  presentation/
    http/
      controllers/
      request/
      response/
      presenters/
  tests/
```

## 4.3 Dependency Rule

Allowed direction only:

- `presentation -> application`
- `application -> domain`
- `infrastructure -> application + domain`
- `domain -> nothing framework-specific`

Forbidden:

- domain importing NestJS
- domain importing Prisma
- domain importing HTTP DTOs
- controllers calling Prisma directly
- modules importing another module’s infrastructure internals

## 4.4 Domain Rules

The domain layer must contain:

- financial invariants
- posting rules
- ledger balancing rules
- period rules
- account constraints
- tax calculation rules
- currency and rounding rules
- audit-sensitive business decisions

The domain layer must be framework-agnostic and testable with pure unit tests.

## 4.5 Application Layer

The application layer orchestrates use cases.

Examples:

- create journal draft
- post journal entry
- reverse journal entry
- create invoice
- approve invoice
- reconcile payment
- close accounting period
- reopen period under privileged policy

Application handlers may:

- validate intent-level input
- start transactions
- load entities
- call domain services
- persist changes through repositories
- emit domain and integration events

Application handlers must not contain presentation logic.

## 4.6 Infrastructure Layer

Infrastructure contains:

- Prisma repositories
- cache adapters
- queue adapters
- storage adapters
- mail adapters
- background jobs
- external service integrations

Infrastructure can depend on frameworks.
Domain cannot.

## 4.7 Transaction Management

Use explicit transaction boundaries at the application layer.

Critical accounting operations must execute inside a single transaction.

Examples:

- post journal entry
- reverse posted transaction
- close period
- settle invoice
- reconcile bank transaction

Use:

- repository methods that can accept transaction context
- service-level transaction orchestration
- idempotency keys for externally triggered writes

For high-integrity financial mutations:

- prefer strict consistency over convenience
- retry safe operations when serialization conflicts occur
- never allow partial posting of ledger lines

## 4.8 Repository Pattern

Define repository interfaces in `domain` or `application/ports`.
Implement them in infrastructure.

Example:

```text
accounting/domain/repositories/journal-entry.repository.ts
accounting/infrastructure/repositories/prisma-journal-entry.repository.ts
```

Repositories expose aggregate-oriented methods, not generic CRUD dumping.

Prefer:

- `save(entry)`
- `findById(id)`
- `findPostableDraftById(id)`
- `existsExternalReference(ref)`

Avoid large generic repository abstractions that hide important domain intent.

## 4.9 Validation

Validation must happen at multiple levels:

### Boundary validation

- request schema validation via DTO + Zod/class-validator at the HTTP edge

### Application validation

- use-case level validation for permissions, workflow state, and business prerequisites

### Domain validation

- invariant enforcement inside entities/value objects/domain services

Never rely only on frontend validation.
Never rely only on database constraints.

## 4.10 Error Handling

Use a formal error taxonomy.

Create a shared error model:

- domain errors
- application errors
- authorization errors
- validation errors
- infrastructure errors
- concurrency errors
- idempotency conflicts

Rules:

- domain errors stay semantic
- controllers map errors to HTTP responses centrally
- never leak raw database errors to the client
- every API error response must be structured and typed

Suggested response shape:

```json
{
  "error": {
    "code": "ACCOUNTING_PERIOD_CLOSED",
    "message": "The accounting period is closed.",
    "details": {}
  }
}
```

## 4.11 Logging

Use structured logging only.

Rules:

- JSON logs in production
- correlation ID on every request
- user ID, organization ID, request ID, module, action, duration
- no sensitive secrets or full credentials in logs
- explicit audit log for sensitive financial actions

Use:

- request logging middleware/interceptor
- domain-aware audit logging for posting, reversal, approval, period close, permission changes

## 4.12 Security

Backend baseline:

- secure HTTP headers
- rate limiting
- CORS policy by environment
- CSRF protection if cookie session model is used
- input sanitization where needed
- OpenAPI-documented auth requirements
- strict RBAC and permission checks at application level
- secrets only through environment/secret manager
- signed URLs for file access where needed

Never put authorization only in controllers.
Authorization must be re-checked in application use cases.

---

# 5. Database Architecture

## 5.1 Primary Database

Use **PostgreSQL**.

Reason:

- ACID guarantees
- mature indexing
- strong transaction semantics
- excellent support for financial systems
- support for JSONB where useful without losing relational discipline
- future readiness for row-level security if needed

## 5.2 ORM / Data Access Strategy

Use **Prisma** as the default persistence layer.

Use **raw SQL** selectively for:

- performance-critical reporting queries
- ledger-heavy aggregations
- advanced database features Prisma does not express cleanly
- lock-sensitive or isolation-sensitive workflows

Do not force ORM purity if it harms correctness or observability.

## 5.3 Migration Strategy

Use forward-only migrations.

Rules:

- all schema changes must be migration-based
- no manual production schema drift
- each migration must be reviewed
- destructive migrations require explicit rollout plan
- seed logic must be separate from migrations

Recommended structure:

```text
packages/db/
  prisma/
    schema.prisma
  migrations/
  seeds/
```

## 5.4 Multi-Tenant Readiness

Design for multi-tenant from day one.

Recommended v1 model:

- **single database**
- **shared schema**
- **tenant/organization ID on tenant-owned tables**

Rules:

- every tenant-owned table has `organization_id`
- composite indexes include tenant dimension where relevant
- repository methods always scope by organization
- never query mutable financial data without tenant scoping

Do not start with separate database per tenant.
Keep the architecture ready to evolve to stronger isolation if enterprise requirements demand it later.

## 5.5 Indexing Strategy

Index intentionally, not automatically.

Create indexes for:

- tenant scoping
- foreign keys used in joins
- date-based reporting
- posting status
- lookup identifiers
- idempotency keys
- audit event retrieval
- invoice number search
- account code search

Examples:

- `(organization_id, status)`
- `(organization_id, created_at desc)`
- `(organization_id, posting_date)`
- `(organization_id, external_reference)` unique where applicable

## 5.6 Financial Data Model Principle

The accounting core must be **ledger-first**.

Core entities should include:

- chart of accounts
- journal entries
- journal lines
- accounting periods
- currencies
- exchange rates
- cost centers / dimensions (optional but recommended design-ready)
- audit records

Rules:

- posted ledger data is immutable
- corrections occur through reversal or adjustment
- no silent mutation of posted lines
- debits and credits must balance in domain logic and database safeguards where possible

---

# 6. API Architecture

## 6.1 Default API Style

Use **REST + OpenAPI** as the primary standard.

## 6.2 Why REST + OpenAPI

This platform is an enterprise accounting system.
It will eventually need:

- external integrations
- stable contracts
- client generation
- auditability of interface changes
- clear versioning
- easier onboarding for future desktop/mobile/web clients

REST + OpenAPI is the most stable and governance-friendly choice.

## 6.3 Do Not Use tRPC as the Primary Contract

Do not use tRPC as the system contract baseline.

Reason:

- too coupled to TypeScript ecosystem
- weaker long-term external interoperability
- weaker contract governance for third-party integrations
- less suitable as the formal enterprise API boundary

If ever used, tRPC can be added only for internal tooling, not as the primary platform contract.

## 6.4 Do Not Use GraphQL as the Write Workflow Default

Do not use GraphQL as the primary backend API for accounting workflows.

Reason:

- financial commands need deterministic, explicit write models
- complex mutation policies become harder to govern
- REST endpoints are clearer for auditing and permission review

GraphQL can be introduced later for highly composable reporting dashboards if a real need appears.

## 6.5 API Rules

- version API explicitly
- document every endpoint in OpenAPI
- generate typed frontend client from OpenAPI
- use cursor pagination for large datasets
- use idempotency keys for externally repeated writes
- use consistent filtering/sorting conventions
- use explicit command endpoints for workflow transitions

Prefer:

- `POST /v1/journal-entries/{id}/post`
- `POST /v1/journal-entries/{id}/reverse`
- `POST /v1/accounting-periods/{id}/close`

Instead of hidden state-change PATCH semantics.

---

# 7. Authentication and Authorization

## 7.1 Auth Strategy

Use:

- centralized authentication module
- OIDC/OAuth2-ready design
- JWT access tokens or secure session model depending on deployment model
- refresh token rotation if token-based auth is used

For architecture readiness, keep identity externalizable.

## 7.2 Authorization Strategy

Use layered authorization:

- organization membership
- role-based access control
- permission-based capability checks
- feature flag checks where needed

Suggested model:

- `organization_owner`
- `organization_admin`
- `accountant`
- `sales_manager`
- `inventory_manager`
- `viewer`

Permissions must be explicit, e.g.:

- `journal.post`
- `journal.reverse`
- `period.close`
- `invoice.approve`
- `report.export`

## 7.3 Auth Rules

- authorization is enforced in application layer
- UI can hide unavailable actions, but backend is authoritative
- audit sensitive permission changes
- never trust role names in frontend only

---

# 8. Caching and Async Processing

## 8.1 Cache

Use **Valkey** for:

- short-lived query acceleration
- rate limiting
- OTP/session support if needed
- distributed locks only where justified
- idempotency coordination
- background job coordination helpers

Do not cache mutable financial truth blindly.

Never use cache as the source of truth for:

- posted ledger data
- invoice state transitions
- audit state

## 8.2 Queue / Async

Use **RabbitMQ** for:

- report generation
- notification fan-out
- file processing
- import jobs
- webhook retries
- long-running background workflows

Queue jobs must be:

- idempotent
- retry-safe
- observable
- dead-letter aware

Do not move financial posting into eventually consistent background jobs unless explicitly designed that way.

---

# 9. Frontend Architecture

## 9.1 Frontend High-Level Shape

Use Next.js App Router.

Structure the frontend as a product shell plus feature modules.

```text
apps/web/
  src/
    app/
    providers/
    shared/
    features/
    widgets/
    entities/
    processes/
    pages/
```

A practical adaptation of layered frontend design is recommended.

## 9.2 Frontend Layering Model

Use this dependency direction:

- `app` can depend on everything
- `pages` depend on `processes`, `widgets`, `features`, `entities`, `shared`
- `processes` depend on `features`, `entities`, `shared`
- `widgets` depend on `features`, `entities`, `shared`
- `features` depend on `entities`, `shared`
- `entities` depend on `shared`
- `shared` depends on nothing above it

This prevents random coupling and makes the UI maintainable at scale.

## 9.3 Frontend Folder Example

```text
apps/web/src/
  app/
    (dashboard)/
    (auth)/
    layout.tsx
    providers.tsx
  processes/
    post-journal-entry/
    close-period/
  pages/
    accounting-dashboard/
    invoices-list/
  widgets/
    sidebar/
    topbar/
    account-balance-card/
    invoice-table/
  features/
    create-invoice/
    approve-invoice/
    account-selector/
    organization-switcher/
  entities/
    invoice/
    account/
    journal-entry/
    organization/
    user/
  shared/
    api/
    config/
    lib/
    hooks/
    ui/
    styles/
    utils/
    types/
```

## 9.4 Server State vs Client State

Use strict separation:

### Server state

Use **TanStack Query** for:

- fetching
- caching
- mutations
- invalidation
- optimistic updates where safe

### Client state

Use **Zustand** only for:

- UI state
- modal state
- draft local interaction state
- non-persistent client workflows

Do not use Zustand for remote canonical data that belongs in server state.

## 9.5 Forms

Use:

- **React Hook Form**
- **Zod** schemas

Rules:

- schema-driven validation
- reusable field components from UI package
- clear error mapping from backend responses
- no duplicated form shape definitions where avoidable

## 9.6 API Layer

Frontend must not call fetch directly across the app.

Create a formal API layer:

```text
shared/api/
  client/
  generated/
  adapters/
  errors/
```

Rules:

- generate the primary client from OpenAPI
- wrap generated client with app-specific adapters where needed
- centralize auth header/session behavior
- centralize error normalization
- centralize retry policy

## 9.7 Rendering Strategy

Use a hybrid rendering strategy.

### Use Server Components for:

- layout composition
- initial data loading where beneficial
- route shells
- low-interactivity pages

### Use Client Components for:

- interactive forms
- filters
- tables with live controls
- modals
- inline editing
- optimistic interactions

Do not convert the whole app into all-client by default.
Do not force everything into server components either.

Use the simplest correct rendering mode per screen.

---

# 10. Design System Architecture

## 10.1 Single Source of Truth Requirement

The entire design system must be controllable from one canonical token source.

This is non-negotiable.

## 10.2 Design System Strategy

Use a dedicated package:

```text
packages/tokens/
packages/ui/
```

### `packages/tokens`

Contains the canonical design tokens.

### `packages/ui`

Contains reusable components built on those tokens.

## 10.3 Canonical Token File

Create a single primary token definition file, for example:

```text
packages/tokens/src/theme.ts
```

This file defines:

- color primitives
- semantic colors
- typography scale
- spacing scale
- radius scale
- shadow scale
- z-index scale
- motion durations
- motion easings
- breakpoints
- container widths

Everything else is generated from this file.

## 10.4 Token Structure

Example conceptual structure:

```ts
export const theme = {
  color: {
    primitive: {...},
    semantic: {
      bg: {...},
      fg: {...},
      border: {...},
      primary: {...},
      success: {...},
      warning: {...},
      danger: {...},
      info: {...}
    }
  },
  typography: {
    fontFamily: {...},
    fontSize: {...},
    fontWeight: {...},
    lineHeight: {...}
  },
  spacing: {...},
  radius: {...},
  shadow: {...},
  motion: {...},
  breakpoint: {...}
}
```

## 10.5 Token Output Rules

Generate from the token source:

- CSS variables for runtime theming
- TypeScript constants/types for component authoring
- Tailwind theme mapping
- Storybook theme usage

Do not hardcode magic values inside components.

## 10.6 Theme Modes

Support at minimum:

- light
- dark

Optionally prepare structure for:

- high contrast
- brand/tenant theme overlays

## 10.7 UI Component Strategy

Use **Radix UI primitives** as accessibility foundations.
Build internal components in `packages/ui`.

Do not scatter component implementations across product code.

Use layers:

- primitive components
- composed shared components
- domain-specific widgets in app layer only when not globally reusable

## 10.8 Tailwind Rule

Tailwind is used as the utility engine, not the design system.

The design system lives in tokens and UI components.
Tailwind consumes the tokens.

## 10.9 Storybook Rule

Every shared UI component must be documented in Storybook.

Include:

- visual states
- variants
- disabled states
- dark mode
- edge cases
- loading states
- error states
- accessibility notes where relevant

---

# 11. Monorepo Structure

Use a workspace monorepo.

Recommended structure:

```text
repo/
  apps/
    web/
    api/
  packages/
    tokens/
    ui/
    api-client/
    config-eslint/
    config-typescript/
    config-prettier/
    shared-types/
    shared-utils/
    db/
  docs/
    adrs/
    architecture/
    api/
    runbooks/
  .github/
    workflows/
```

## Rules

- apps may depend on packages
- packages may depend on lower-level packages
- apps must not import from each other directly
- avoid circular imports at all levels

---

# 12. Configuration Strategy

## 12.1 Environment Separation

Define environments clearly:

- local
- development
- staging
- production

## 12.2 Config Loading

Backend and frontend must each have typed config loaders.

Never access environment variables all over the codebase.

Create centralized config modules.

Examples:

```text
apps/api/src/config/
apps/web/src/shared/config/
```

Rules:

- validate env on startup
- fail fast on missing critical config
- separate server-only and client-exposed variables
- never leak secrets to client bundle

---

# 13. Testing Strategy

## 13.1 Test Pyramid

### Domain unit tests

Must cover:

- balancing rules
- posting rules
- reversal rules
- period constraints
- tax calculations
- money/currency rounding behavior

### Application integration tests

Must cover:

- use-case workflows
- transactions
- repository behavior
- authorization rules
- idempotency

### API tests

Must cover:

- endpoint behavior
- schema conformance
- auth and permission mapping
- error response shapes

### Frontend component tests

Must cover:

- component logic
- form behavior
- state transitions
- accessibility-critical interactions

### E2E tests

Must cover:

- login
- organization switching
- create invoice
- post journal entry
- reconcile payment
- close period
- export report

## 13.2 Testing Rules

- every domain bug gets a regression test
- every migration with business impact gets test coverage
- no financial workflow merges without automated tests
- use deterministic fixtures and factories

---

# 14. Observability and Auditability

## 14.1 Observability Baseline

Implement:

- structured logging
- metrics
- traces
- health endpoints
- readiness/liveness checks
- background job visibility

## 14.2 Auditability Baseline

Create a dedicated audit module.

Audit events must exist for:

- login-sensitive actions
- role/permission changes
- journal posting
- journal reversal
- period close / reopen
- invoice approval / cancellation
- import/export of sensitive data

Audit records should capture:

- actor
- organization
- action
- target type
- target ID
- timestamp
- relevant metadata

---

# 15. DevOps Baseline

## 15.1 Containerization

Both `web` and `api` must have production-grade Dockerfiles.

Rules:

- multi-stage builds
- minimal runtime images
- non-root user where feasible
- deterministic install with lockfile

## 15.2 CI/CD

Use GitHub Actions.

Minimum pipeline:

1. install
2. typecheck
3. lint
4. unit tests
5. integration tests
6. build
7. container build
8. security scan
9. deploy to staging
10. gated production deployment

## 15.3 Release Rules

- no direct production-only hotfixes without backporting to source
- tag releases
- keep migration versioning traceable
- keep OpenAPI version history

---

# 16. Financial Domain Implementation Rules

These rules are critical.

## 16.1 Ledger Immutability

Once posted, ledger lines are immutable.

## 16.2 Correction Model

Use:

- reversal entries
- adjustment entries

Do not mutate posted data in place.

## 16.3 Idempotency

Any externally triggered financial write must be idempotent.

## 16.4 Period Safety

Closed periods must not accept ordinary writes.

## 16.5 Money Type

Do not use floating-point arithmetic for money.

Use:

- integer minor units where appropriate, or
- exact decimal handling strategy consistently across the platform

## 16.6 Domain Events

Emit clear domain events for important state transitions.

Examples:

- `journal_entry_posted`
- `journal_entry_reversed`
- `invoice_approved`
- `invoice_paid`
- `accounting_period_closed`

---

# 17. Frontend UX Implementation Rules

## 17.1 UX Principles

For accounting software:

- prioritize clarity over novelty
- dense but readable information architecture
- strong keyboard support
- stable navigation patterns
- table-heavy workflows must remain fast
- destructive actions must be explicit
- financial states must be visually unambiguous

## 17.2 Table Strategy

Use a consistent data grid/table architecture.

Table features must be composable:

- sorting
- filtering
- pagination
- bulk selection
- column visibility
- export hooks
- loading skeletons
- empty states

## 17.3 Feedback Strategy

Every async user action must have:

- pending state
- success state
- failure state
- field-level errors where relevant

---

# 18. Non-Negotiable Engineering Rules

1. No business logic inside React pages.
2. No Prisma queries inside controllers.
3. No framework code inside domain entities.
4. No duplicate design tokens across files.
5. No direct fetch usage scattered across app code.
6. No untyped API responses.
7. No implicit cross-module database coupling.
8. No mutation of posted accounting records.
9. No bypassing tests for financial workflows.
10. No introducing microservices without proven scaling need.

---

# 19. Recommended Initial Domain Modules for v1

Backend modules:

- identity
- organizations
- accounting
- invoices
- customers
- vendors
- treasury
- reports
- audit
- files
- notifications

Frontend product areas:

- auth
- organization shell
- dashboard
- chart of accounts
- journal entries
- invoices
- customers
- vendors
- treasury
- reports
- settings
- audit logs

---

# 20. Implementation Order

## Phase 1 — Platform Foundation

- monorepo setup
- shared configs
- tokens package
- ui package
- web shell
- api bootstrap
- docker baseline
- CI baseline
- OpenAPI baseline

## Phase 2 — Identity and Organization Core

- auth
- organization model
- memberships
- roles/permissions
- audit baseline

## Phase 3 — Accounting Core

- chart of accounts
- journal draft model
- posting engine
- reversal engine
- periods
- ledger queries

## Phase 4 — Commercial Flows

- customers
- vendors
- invoices
- payments
- reconciliation foundations

## Phase 5 — Reporting and Operations

- financial statements
- exports
- background reports
- operational dashboards

---

# 21. Final Implementation Directive

Claude Code must treat this document as the implementation constitution for the web platform.

Default behavior should be:

- preserve architecture
- prefer maintainability over short-term shortcuts
- prefer explicitness over cleverness
- prefer typed contracts over implicit behavior
- prefer domain correctness over UI speed hacks
- prefer composition over duplication
- prefer stable enterprise patterns over trend-driven substitutions

If a decision is not explicitly covered here, extend the system in the same direction as this specification rather than introducing a conflicting style.
