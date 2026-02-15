@echo off
echo Starting VinIA Application...
echo This will build and start both Backend and Frontend containers.
echo Please ensure Docker Desktop is running.
docker-compose up --build
pause
