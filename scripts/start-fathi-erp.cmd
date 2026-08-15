@echo off
cd /d "%~dp0"
if not exist "node_modules" npm ci --omit=dev
set NODE_ENV=production
node server.cjs
