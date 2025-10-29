#!/bin/bash

set -e

echo "Starting Journey Platform..."

echo "1. Starting Docker services..."
docker compose up -d

echo "2. Waiting for services to be ready..."
sleep 10

echo "3. Installing dependencies..."
npm install

echo "4. Building shared package..."
npm run build --workspace=packages/shared

echo "5. Building backend..."
npm run build --workspace=packages/backend

echo "6. Starting backend server..."
npm run start --workspace=packages/backend &
SERVER_PID=$!

echo "7. Starting Temporal worker..."
npm run start:worker --workspace=packages/backend &
WORKER_PID=$!

echo "8. Starting frontend..."
npm run dev --workspace=packages/frontend &
FRONTEND_PID=$!

echo ""
echo "Journey Platform started successfully!"
echo ""
echo "Services:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend API: http://localhost:3001"
echo "  - Temporal UI: http://localhost:8080"
echo "  - Mailhog UI: http://localhost:8025"
echo ""
echo "Process IDs:"
echo "  - Server: $SERVER_PID"
echo "  - Worker: $WORKER_PID"
echo "  - Frontend: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services"

wait
