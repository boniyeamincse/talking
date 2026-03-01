@echo off
title BaniTalk - Full Stack Launcher
color 0A

echo.
echo ========================================
echo   BANITALK - FULL STACK LAUNCHER
echo ========================================
echo.
echo Starting all services...
echo.

:: Start Laravel Backend (API)
echo [1/2] Starting Laravel Backend API...
start "BaniTalk Backend API" cmd /k "cd /d %~dp0 && start-backend.bat"
timeout /t 3 /nobreak >nul

:: Start React Web Frontend
echo [2/2] Starting React Web Frontend...
start "BaniTalk Web App" cmd /k "cd /d %~dp0 && start-web.bat"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   ALL SERVICES STARTED!
echo ========================================
echo.
echo Backend API:  http://localhost:8000
echo Web App:      http://localhost:3000
echo.
echo Press any key to open Web App in browser...
pause >nul

start http://localhost:3000

echo.
echo Services are running in separate windows.
echo Close those windows to stop the services.
echo.
pause
