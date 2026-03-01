@echo off
echo Starting BaniTalk Backend (Laravel API)...
echo.

cd /d "%~dp0api"

echo Checking if server is already running...
netstat -ano | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo Backend is already running on port 8000
    pause
    exit /b
)

echo Starting Laravel development server on http://localhost:8000
echo.
php artisan serve --host=0.0.0.0 --port=8000

pause
