@echo off
echo Starting BaniTalk Web App (React + Vite)...
echo.

cd /d "%~dp0web"

echo Checking if server is already running...
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo Web app is already running on port 3000
    pause
    exit /b
)

echo Installing dependencies if needed...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
)

echo.
echo Starting Vite development server on http://localhost:3000
echo.
call npm run dev

pause
