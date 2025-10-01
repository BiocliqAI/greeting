#!/bin/bash

set -e

echo "Running custom monorepo build script..."

# Build Backend
echo "Building backend..."
cd backend
npm install
cd ..

# Build Frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Monorepo build complete."
