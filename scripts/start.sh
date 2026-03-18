#!/usr/bin/env bash
# ─────────────────────────────────────────────────
# Hesabdari — Start all services
# Usage: bash scripts/start.sh
# ─────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[start]${NC} $*"; }
warn() { echo -e "${YELLOW}[start]${NC} $*"; }
info() { echo -e "${CYAN}[start]${NC} $*"; }

# ── 1. Kill any existing Node.js processes from previous runs ──
log "Killing stale Node.js processes..."
if command -v taskkill &>/dev/null; then
  taskkill //F //IM node.exe > /dev/null 2>&1 || true
else
  pkill -f "node" > /dev/null 2>&1 || true
fi
sleep 1

# ── 2. Start infrastructure (Docker) — skip if Docker not available ──
if docker info > /dev/null 2>&1; then
  log "Starting Docker services (PostgreSQL, Valkey, RabbitMQ)..."
  docker compose up -d

  info "Waiting for PostgreSQL..."
  RETRIES=0
  until docker exec hesabdari-postgres pg_isready -U hesabdari > /dev/null 2>&1; do
    RETRIES=$((RETRIES + 1))
    [ $RETRIES -gt 30 ] && { warn "PostgreSQL timeout — check docker"; break; }
    sleep 1
  done
  log "PostgreSQL ready."

  info "Waiting for Valkey..."
  RETRIES=0
  until docker exec hesabdari-valkey valkey-cli ping 2>/dev/null | grep -q PONG; do
    RETRIES=$((RETRIES + 1))
    [ $RETRIES -gt 15 ] && { warn "Valkey timeout"; break; }
    sleep 1
  done
  log "Valkey ready."

  info "Waiting for RabbitMQ..."
  RETRIES=0
  until docker exec hesabdari-rabbitmq rabbitmq-diagnostics -q ping > /dev/null 2>&1; do
    RETRIES=$((RETRIES + 1))
    [ $RETRIES -gt 30 ] && { warn "RabbitMQ timeout — continuing"; break; }
    sleep 2
  done
  log "RabbitMQ ready."
else
  warn "Docker not available — skipping infrastructure services."
  warn "Make sure PostgreSQL, Valkey, and RabbitMQ are running externally."
fi

# ── 3. Generate Prisma client ──
log "Generating Prisma client..."
pnpm db:generate > /dev/null 2>&1 || warn "Prisma generate failed — continuing"

# ── 4. Start API server (NestJS on port 4000) ──
log "Starting API server (port 4000)..."
pnpm --filter @hesabdari/api dev > "$ROOT/.api.log" 2>&1 &
API_PID=$!
echo "$API_PID" > "$ROOT/.api.pid"

info "Waiting for API..."
RETRIES=0
until curl -sf http://localhost:4000/api/v1/health > /dev/null 2>&1; do
  RETRIES=$((RETRIES + 1))
  if [ $RETRIES -gt 30 ]; then
    warn "API not responding after 30s — check .api.log"
    break
  fi
  sleep 1
done
log "API ready (PID: $API_PID)."

# ── 5. Start Web server (Next.js on port 3000) ──
log "Starting Web server (port 3000)..."
pnpm --filter @hesabdari/web dev > "$ROOT/.web.log" 2>&1 &
WEB_PID=$!
echo "$WEB_PID" > "$ROOT/.web.pid"

info "Waiting for Web..."
RETRIES=0
until curl -sf http://localhost:3000 > /dev/null 2>&1; do
  RETRIES=$((RETRIES + 1))
  if [ $RETRIES -gt 30 ]; then
    warn "Web not responding after 30s — check .web.log"
    break
  fi
  sleep 1
done
log "Web ready (PID: $WEB_PID)."

# ── Done ──
echo ""
log "═══════════════════════════════════════════"
log "  All services running!"
log "═══════════════════════════════════════════"
info "  Web:      http://localhost:3000"
info "  API:      http://localhost:4000"
info "  Postgres: localhost:5432"
info "  Valkey:   localhost:6379"
info "  RabbitMQ: localhost:5672 (mgmt: 15672)"
echo ""
info "  Logs:  tail -f .api.log .web.log"
info "  Stop:  pnpm stop:all"
log "═══════════════════════════════════════════"
