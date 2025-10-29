#!/bin/bash

set -e

echo "Starting Journey Platform in development mode..."

echo "1. Checking Docker services..."
if ! docker compose ps | grep -q "Up"; then
    echo "   Starting Docker services..."
    docker compose up -d
    echo "   Waiting for services to be ready..."
    sleep 15
else
    echo "   Docker services already running"
fi

echo ""
echo "2. Installing dependencies (if needed)..."
npm install

echo ""
echo "3. Building shared package..."
cd packages/shared && npm run build && cd ../..

echo ""
echo "Journey Platform is ready!"
echo ""
echo "To start the services, run these commands in separate terminals:"
echo "  Terminal 1: npm run dev:backend"
echo "  Terminal 2: npm run dev:worker"
echo "  Terminal 3: npm run dev:frontend"
echo ""
echo "Or use 'npm start' to start all services together"
