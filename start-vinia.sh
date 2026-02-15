#!/bin/sh
echo "Starting VinIA Application..."

# Check if Docker is running
echo "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo ""
    echo "[ERROR] Docker is not running or not accessible!"
    echo "Please make sure Docker Desktop is installed and running."
    echo "If you just started Docker Desktop, wait a minute for it to initialize."
    echo ""
    exit 1
fi

echo "Docker is running. Building and starting services..."
docker-compose up --build
