# ── Build stage ──────────────────────────────────────────────────────
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.6.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/ui/package.json packages/ui/
COPY packages/design-tokens/package.json packages/design-tokens/
COPY packages/shared/package.json packages/shared/
COPY packages/contracts/package.json packages/contracts/
COPY packages/api-client/package.json packages/api-client/
COPY packages/config/typescript/package.json packages/config/typescript/
COPY packages/config/eslint/package.json packages/config/eslint/
COPY packages/config/prettier/package.json packages/config/prettier/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/ packages/
COPY apps/web/ apps/web/

# Build packages and web app
RUN pnpm --filter @hesabdari/design-tokens build && \
    pnpm --filter @hesabdari/shared build && \
    pnpm --filter @hesabdari/contracts build && \
    pnpm --filter @hesabdari/api-client build && \
    pnpm --filter @hesabdari/ui build && \
    pnpm --filter @hesabdari/web build

# ── Production stage ─────────────────────────────────────────────────
FROM node:24-alpine AS runner

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER appuser

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
