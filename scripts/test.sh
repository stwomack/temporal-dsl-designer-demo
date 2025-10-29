#!/bin/bash

set -e

echo "Running Journey Platform tests..."

echo ""
echo "1. Testing shared package..."
npm run test --workspace=packages/shared

echo ""
echo "All tests passed!"
