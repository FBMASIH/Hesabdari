# Local Development Runbook

## Prerequisites

- **Node.js 24+**: Install via nvm or fnm
- **pnpm 10+**: `corepack enable && corepack prepare pnpm@10.6.0 --activate`
- **Docker**: For PostgreSQL, Valkey, and RabbitMQ

## First-Time Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start infrastructure
docker compose up -d

# 3. Configure environment
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Set up database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5. Start development
pnpm dev
```

## Daily Workflow

```bash
# Start infrastructure (if not running)
docker compose up -d

# Start dev servers
pnpm dev
```

## Common Tasks

### Reset Database

```bash
docker compose down -v
docker compose up -d postgres
pnpm db:migrate
pnpm db:seed
```

### Add a Database Migration

```bash
# Edit packages/db/prisma/schema.prisma
pnpm db:migrate
```

### Run Tests

```bash
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests (requires running dev server)
```

### Build for Production

```bash
pnpm build
```

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable              | Default                                                     | Description                    |
| --------------------- | ----------------------------------------------------------- | ------------------------------ |
| `DATABASE_URL`        | `postgresql://hesabdari:hesabdari@localhost:5432/hesabdari` | PostgreSQL connection          |
| `VALKEY_HOST`         | `localhost`                                                 | Valkey (Redis-compatible) host |
| `VALKEY_PORT`         | `6379`                                                      | Valkey port                    |
| `API_PORT`            | `4000`                                                      | Backend API port               |
| `JWT_SECRET`          | -                                                           | JWT signing secret (required)  |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000`                                     | API URL for frontend           |

## Troubleshooting

### Port conflicts

Check if ports 3000, 4000, 5432, 6379, or 5672 are already in use.

### Database connection refused

Ensure PostgreSQL container is running: `docker compose ps`

### Prisma client out of sync

Regenerate: `pnpm db:generate`
