#!/bin/bash

set -e

echo "Stopping Journey Platform..."

echo "1. Stopping Node processes..."
pkill -f "ts-node src/server.ts" || true
pkill -f "ts-node src/worker.ts" || true
pkill -f "vite" || true

echo "2. Stopping Docker services..."
docker compose down

echo ""
echo "Journey Platform stopped successfully!"
