#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting monorepo deployment script..."

# --- Backend Setup and Start ---
echo "Setting up and starting backend..."
cd backend
npm install
npm start & # Start backend in background
BACKEND_PID=$!
cd ..

# --- Frontend Setup, Build, and Start ---
echo "Setting up, building, and starting frontend..."
cd frontend
npm install
npm run build
npm start & # Start frontend in background (npm run preview)
FRONTEND_PID=$!
cd ..

echo "Backend (PID: $BACKEND_PID) and Frontend (PID: $FRONTEND_PID) services started."
echo "Keeping the main process alive..."

# Keep the main script alive indefinitely so the container doesn't exit
tail -f /dev/null
