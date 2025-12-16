@echo off
REM Start Vite Dev Server from build-a-wig directory
cd /d "%~dp0"
echo Starting Vite dev server from: %CD%
echo.
call npm run dev

