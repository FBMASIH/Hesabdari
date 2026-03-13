@echo off
title Hesabdari Dev Environment
color 0A

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║      HESABDARI - Dev Environment         ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Check Docker
echo  [1/5] Checking Docker...
docker version >nul 2>&1
if errorlevel 1 (
    echo  [!] Docker is not running. Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo  [~] Waiting for Docker engine...
    :wait_docker
    timeout /t 5 /nobreak >nul
    docker version >nul 2>&1
    if errorlevel 1 goto wait_docker
)
echo  [OK] Docker is ready.

:: Stop native PostgreSQL if running (conflicts with Docker port)
echo.
echo  [2/5] Starting infrastructure containers...
net stop postgresql-x64-16 >nul 2>&1
docker compose up -d
if errorlevel 1 (
    echo  [!] Docker Compose failed. Check docker-compose.yml
    pause
    exit /b 1
)

:: Wait for healthy
echo.
echo  [3/5] Waiting for services to be healthy...
:wait_healthy
timeout /t 3 /nobreak >nul
docker compose ps --format "{{.Health}}" 2>nul | findstr /i "starting" >nul
if not errorlevel 1 goto wait_healthy
echo  [OK] All containers healthy.

:: Push schema
echo.
echo  [4/5] Syncing database schema...
cd /d "%~dp0packages\db"
call npx prisma db push --skip-generate 2>nul
if errorlevel 1 (
    echo  [!] Schema push failed. Check DATABASE_URL in .env
    pause
    exit /b 1
)
cd /d "%~dp0"
echo  [OK] Database schema synced.

:: Start dev servers
echo.
echo  [5/5] Starting application servers...
echo.
echo  ┌─────────────────────────────────────────┐
echo  │  API:       http://localhost:4000        │
echo  │  Frontend:  http://localhost:3000        │
echo  │  Swagger:   http://localhost:4000/api/docs│
echo  │  RabbitMQ:  http://localhost:15672       │
echo  └─────────────────────────────────────────┘
echo.
echo  Press Ctrl+C to stop all servers.
echo.

pnpm dev
