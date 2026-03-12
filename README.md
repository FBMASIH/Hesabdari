# Hesabdari — Enterprise Web Accounting Platform

A web-first, enterprise-grade accounting platform built with modern technologies and clean architecture principles.

## Tech Stack

### Frontend

- Next.js 16.1.x (App Router)
- React 19.2.x
- TypeScript 5.9.x
- Tailwind CSS 4.1.x
- TanStack Query 5.x
- Zustand 5.x
- React Hook Form + Zod
- Radix UI primitives

### Backend

- NestJS 11.1.x (Fastify adapter)
- PostgreSQL 18.x
- Prisma 7.x
- Valkey 8.x (cache/rate-limiting)
- RabbitMQ 4.2.x (async jobs)
- OpenAPI 3.2

### Tooling

- pnpm 10.x workspaces
- Turborepo
- Vitest
- Playwright
- Docker

## Quick Start

### Prerequisites

- Node.js 24+
- pnpm 10+
- Docker & Docker Compose

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd hesabdari

# Install dependencies
pnpm install

# Start infrastructure services
docker compose up -d

# Set up environment
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed initial data
pnpm db:seed

# Start development servers
pnpm dev
```

### Available Scripts

| Script              | Description                        |
| ------------------- | ---------------------------------- |
| `pnpm dev`          | Start all apps in development mode |
| `pnpm build`        | Build all apps and packages        |
| `pnpm lint`         | Lint all packages                  |
| `pnpm typecheck`    | Type-check all packages            |
| `pnpm test`         | Run all unit tests                 |
| `pnpm test:e2e`     | Run end-to-end tests               |
| `pnpm format`       | Format all files with Prettier     |
| `pnpm format:check` | Check formatting                   |
| `pnpm db:generate`  | Generate Prisma client             |
| `pnpm db:migrate`   | Run database migrations            |
| `pnpm db:seed`      | Seed the database                  |

### Services

| Service             | URL                            |
| ------------------- | ------------------------------ |
| Web App             | http://localhost:3000          |
| API                 | http://localhost:4000          |
| API Docs (Swagger)  | http://localhost:4000/api/docs |
| RabbitMQ Management | http://localhost:15672         |

## Architecture

This project follows a **Modular Monolith** architecture with **Clean Architecture** principles. See [docs/architecture/overview.md](docs/architecture/overview.md) for details.

## Project Structure

```
hesabdari/
├── apps/
│   ├── web/                  # Next.js frontend
│   └── api/                  # NestJS backend
├── packages/
│   ├── design-tokens/        # Design system tokens (single source of truth)
│   ├── ui/                   # Shared UI component library
│   ├── db/                   # Prisma schema, migrations, seeds
│   ├── shared/               # Shared types and utilities
│   ├── contracts/            # API contracts (Zod schemas)
│   ├── api-client/           # Typed API client
│   └── config/               # Shared ESLint, TypeScript, Prettier configs
├── docs/
│   ├── adrs/                 # Architecture Decision Records
│   ├── architecture/         # Architecture documentation
│   └── runbooks/             # Operational runbooks
└── .github/workflows/        # CI/CD pipelines
```

## License

Private — All rights reserved.
