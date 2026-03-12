# Architecture Overview

## Architectural Style

Hesabdari uses a **Modular Monolith** with **Clean Architecture** (DDD-lite) as its foundational pattern.

### Why Modular Monolith?

- Speed of development without distributed system complexity
- Strong consistency for financial transactions
- Shared domain model without duplication
- Easier testing and local development
- Clear module boundaries that can evolve to microservices if needed

### Backend Architecture

The backend is a layered, modular NestJS application with strict internal boundaries:

```
apps/api/src/
├── platform/           # Cross-cutting infrastructure
│   ├── database/       # Prisma service
│   ├── cache/          # Valkey service
│   ├── logging/        # Structured logging
│   ├── health/         # Health endpoints
│   ├── errors/         # Error taxonomy
│   ├── filters/        # Exception filters
│   ├── guards/         # Auth guards
│   ├── decorators/     # Custom decorators
│   └── interceptors/   # Request interceptors
└── modules/            # Domain modules
    ├── identity/
    ├── organizations/
    ├── accounting/     # Core accounting engine
    ├── invoices/
    ├── customers/
    ├── vendors/
    ├── inventory/
    ├── treasury/
    ├── reports/
    ├── audit/
    ├── notifications/
    └── files/
```

### Module Internal Structure

Each module follows Clean Architecture layering:

```
modules/<name>/
├── domain/              # Business rules, entities, value objects
│   ├── entities/
│   ├── value-objects/
│   ├── rules/
│   └── repositories/   # Repository interfaces
├── application/         # Use cases, orchestration
│   ├── services/
│   └── dto/
├── infrastructure/      # Framework-dependent implementations
│   ├── repositories/   # Prisma repository implementations
│   └── strategies/
├── presentation/        # HTTP layer
│   └── http/
│       └── controllers/
└── tests/
```

### Dependency Rule

```
presentation → application → domain
infrastructure → application + domain
domain → nothing framework-specific
```

**Forbidden:**

- Domain importing NestJS, Prisma, or HTTP concerns
- Controllers calling Prisma directly
- Modules accessing another module's infrastructure

### Frontend Architecture

The frontend uses Next.js App Router with a layered feature architecture:

```
apps/web/src/
├── app/                 # Next.js routes and layouts
│   ├── (auth)/         # Public auth routes
│   └── (dashboard)/    # Protected dashboard routes
├── providers/           # React context providers
├── widgets/             # Composite UI blocks (AppShell, Sidebar)
├── features/            # Product feature modules
│   ├── auth/
│   ├── dashboard/
│   ├── accounting/
│   └── ...
└── shared/              # Reusable hooks, utils, config, types
```

### Design System

The design system is controlled from a single source of truth:

```
packages/design-tokens/  → Canonical token definitions
packages/ui/             → Reusable components built on tokens
```

Tokens generate: CSS variables, TypeScript types, and Tailwind theme configuration.

### Data Flow

```
Frontend (Next.js)
    ↓ HTTP (REST + OpenAPI)
API Gateway (NestJS + Fastify)
    ↓ Application Layer
Domain Logic (Pure TypeScript)
    ↓ Repository Pattern
PostgreSQL (via Prisma)
```

### Multi-Tenancy

- Single database, shared schema
- All tenant-owned tables include `organization_id`
- Repository methods always scope by organization
- Composite indexes include tenant dimension

### Financial Data Principles

- Ledger data is immutable once posted
- Corrections through reversal/adjustment entries only
- Debits must equal credits (enforced in domain + DB)
- Money stored as integer minor units (no floating-point)
- Closed periods reject ordinary writes
- Idempotency keys for external writes
