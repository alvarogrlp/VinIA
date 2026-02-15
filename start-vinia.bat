@echo off
echo Starting VinIA Application...

echo Checking Docker status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Docker is not running or not accessible!
    echo Please make sure Docker Desktop is installed and running.
    echo If you just started Docker Desktop, wait a minute for it to initialize.
    echo.
    pause
    exit /b
)

echo Docker is running. Building and starting services...
docker-compose up --build
pause
