@echo off
title Hesabdari - Stopping
color 0C

echo.
echo  Stopping Hesabdari dev environment...
echo.

:: Kill Node.js processes (API + Frontend)
taskkill /f /im "node.exe" >nul 2>&1
echo  [OK] Application servers stopped.

:: Stop Docker containers
docker compose down
echo  [OK] Infrastructure containers stopped.

echo.
echo  All services stopped.
timeout /t 3
