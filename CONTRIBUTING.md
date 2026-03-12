# Contributing to Hesabdari

Thank you for contributing to Hesabdari. This document describes the conventions and workflow required to keep the codebase healthy.

## Prerequisites

- Node.js >= 24
- pnpm >= 10
- Docker (for PostgreSQL, Valkey, RabbitMQ)

## Getting Started

```bash
# Clone and install
pnpm install

# Start infrastructure services
docker compose up -d

# Set up environment
cp .env.example .env

# Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Start development
pnpm dev
```

## Branch Strategy

- `main` — always releasable, protected
- Feature branches: `feat/<scope>/<short-description>`
- Bug fixes: `fix/<scope>/<short-description>`
- Refactors: `refactor/<scope>/<short-description>`

Keep branches short-lived. Target small, focused PRs.

## Commit Messages

We enforce [Conventional Commits](https://www.conventionalcommits.org/) via commitlint.

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `build`, `ci`, `perf`, `style`

**Scopes:** `api`, `web`, `ui`, `db`, `contracts`, `shared`, `api-client`, `design-tokens`, `config`, `identity`, `organizations`, `accounting`, `invoices`, `customers`, `vendors`, `inventory`, `treasury`, `reports`, `audit`, `notifications`, `files`, `ci`, `docker`, `deps`, `repo`, `docs`, `release`

Examples:

```
feat(invoices): add sales return invoice endpoint
fix(treasury): correct cheque status transition validation
docs(accounting): document journal entry balancing rules
chore(deps): update prisma to 7.1
```

## Pre-commit Checks

Husky runs automatically on commit:

- **pre-commit**: lint-staged (format + lint changed files)
- **commit-msg**: commitlint (validate message format)

## Quality Checklist

Before submitting a PR, verify locally:

```bash
pnpm typecheck    # Type checking
pnpm lint         # ESLint
pnpm format:check # Prettier
pnpm test         # Unit tests
pnpm build        # Full build
```

## Architecture Rules

### Backend Modules

Each module follows clean architecture with four layers:

- `domain/` — entities, value objects, repository interfaces, business rules
- `application/` — services (use cases), DTOs
- `infrastructure/` — Prisma repository implementations, external integrations
- `presentation/` — HTTP controllers, request/response mapping

**Dependency rule:** `presentation → application → domain`. Infrastructure implements domain interfaces.

### Domain Invariants

- **Money**: Store in Rial (IRR) as integer. No floating point. Toman is display-only.
- **Journal entries**: Debits must equal credits. Enforced in domain and database.
- **Closed periods**: No ordinary writes allowed.
- **Multi-tenancy**: All queries scoped by `organization_id`.

### Frontend Features

- Feature-sliced architecture under `src/features/`
- Shared UI components from `packages/ui/`
- Design tokens from `packages/design-tokens/` — never hardcode colors/spacing

## Database Migrations

- Never edit existing migrations
- Always generate new migrations: `pnpm db:migrate`
- Test migrations against a fresh database before PR
- Include rollback consideration in PR description

## Security

- Never commit `.env` files or secrets
- Never log sensitive data (passwords, tokens, PII)
- Validate all external input at API boundaries
- Use parameterized queries (Prisma handles this)

## Code Review

All PRs require review. Reviewers should verify:

- [ ] Domain invariants preserved
- [ ] No secrets or credentials
- [ ] Tests cover changed behavior
- [ ] Architecture boundaries respected
- [ ] Types are explicit (no `any`)
