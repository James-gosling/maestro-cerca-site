#!/bin/bash
set -e

echo "🚀 Starting deployment for Maestro Cerca..."

echo "📥 Pulling latest changes from git..."
git pull origin main

echo "🏗️ Building and starting Docker containers..."
# -d: run in background
# --build: force rebuild of the app image to include new code
# --remove-orphans: clean up containers not defined in the compose file
docker compose -f docker-compose.yml up -d --build --remove-orphans

echo "🧹 Cleaning up old Docker images to free up space..."
# Force prune dangling images (avoids disk space issues on small VPS)
docker image prune -f

echo "✅ Deployment completed successfully!"
