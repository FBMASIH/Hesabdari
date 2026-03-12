# ── Build stage ──────────────────────────────────────────────────────
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.6.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY packages/contracts/package.json packages/contracts/
COPY packages/config/typescript/package.json packages/config/typescript/
COPY packages/config/eslint/package.json packages/config/eslint/
COPY packages/config/prettier/package.json packages/config/prettier/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/config/ packages/config/
COPY packages/db/ packages/db/
COPY packages/shared/ packages/shared/
COPY packages/contracts/ packages/contracts/
COPY apps/api/ apps/api/

# Generate Prisma client
RUN pnpm --filter @hesabdari/db db:generate

# Build packages and API
RUN pnpm --filter @hesabdari/shared build && \
    pnpm --filter @hesabdari/contracts build && \
    pnpm --filter @hesabdari/api build

# ── Production stage ─────────────────────────────────────────────────
FROM node:24-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.6.0 --activate
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

WORKDIR /app

COPY --from=builder /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /app/packages/contracts/package.json ./packages/contracts/

USER appuser

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]
