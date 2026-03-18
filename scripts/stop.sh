#!/usr/bin/env bash
# ─────────────────────────────────────────────────
# Hesabdari — Stop all services
# Usage: bash scripts/stop.sh
# ─────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log()  { echo -e "${RED}[stop]${NC} $*"; }
ok()   { echo -e "${GREEN}[stop]${NC} $*"; }

# ── 1. Kill all Node.js processes ──
log "Killing all Node.js processes..."
if command -v taskkill &>/dev/null; then
  taskkill //F //IM node.exe > /dev/null 2>&1 || true
else
  pkill -f "node" > /dev/null 2>&1 || true
fi

# ── 2. Clean up PID files ──
rm -f "$ROOT/.api.pid" "$ROOT/.web.pid" 2>/dev/null || true

# ── 3. Stop Docker services (skip if Docker not available) ──
if docker info > /dev/null 2>&1; then
  log "Stopping Docker services..."
  docker compose down 2>/dev/null || true
else
  log "Docker not available — skipping."
fi

# ── 4. Clean up log files ──
rm -f "$ROOT/.api.log" "$ROOT/.web.log" 2>/dev/null || true

# ── Done ──
echo ""
ok "═══════════════════════════════════════════"
ok "  All services stopped."
ok "═══════════════════════════════════════════"
