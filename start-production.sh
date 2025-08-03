#!/bin/bash

# Production Startup Script for HR Backend

set -e

echo "Starting HR Backend in production mode..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "Error: .env.production file not found!"
    echo "Please copy .env.production.template to .env.production and update with your values."
    exit 1
fi

# Load environment variables
export 

# Start services
echo "Starting Docker services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Run migrations
echo "Running database migrations..."
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:migrate

# Run seeds (only if database is empty)
echo "Running database seeds..."
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:seed:all

# Health check
echo "Performing health check..."
sleep 10
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "Application is healthy and running!"
    echo "Access your application at: https://your-domain.com"
    echo "API Documentation: https://your-domain.com/api-docs"
else
    echo "Health check failed, but application might still be starting up"
fi

echo "Production startup complete!"
