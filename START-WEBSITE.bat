@echo off
title sense website - local preview
cd /d "%~dp0"

REM --- If the site is already running on port 5173, just open it (no duplicate) ---
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
  echo The website is already running. Opening it in your browser...
  start "" http://localhost:5173/
  timeout /t 2 >nul
  exit /b
)

REM --- First-time setup: install dependencies if missing (runs once) ---
if not exist "node_modules\" (
  echo First-time setup: installing dependencies. This runs once and may take a minute...
  echo.
  call npm install
  echo.
)

echo ============================================================
echo   Starting the sense website preview...
echo   Your browser will open automatically in a few seconds.
echo.
echo   KEEP THIS WINDOW OPEN while you view/edit the site.
echo   To stop: close this window or press Ctrl+C.
echo ============================================================
echo.

REM --- Start Vite dev server and auto-open the browser ---
call npm run dev -- --open

REM --- If the server stops or errors, keep the window open so you can read why ---
echo.
echo The preview server has stopped.
pause
