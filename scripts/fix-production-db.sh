#!/bin/bash

# Fix Production Database Script
# This script fixes the database issues in production

set -e

echo "Fixing production database..."

# Check if containers are running
if ! docker-compose -f docker-compose.production.yml ps | grep -q "hr_backend_api_prod"; then
    echo "Error: HR Backend container is not running!"
    echo "Please start the containers first:"
    echo "docker-compose -f docker-compose.production.yml up -d"
    exit 1
fi

# Run database migrations
echo "Running database migrations..."
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:migrate

# Run database seeds
echo "Running database seeds..."
docker-compose -f docker-compose.production.yml exec hr_backend npx sequelize-cli db:seed:all

# Create performance indexes
echo "Creating performance indexes..."
docker-compose -f docker-compose.production.yml exec -T postgres psql -U postgres -d coolnet_hrms -f /docker-entrypoint-initdb.d/create-indexes.sql

echo "Database fix completed successfully!"
echo ""
echo "You can now check the logs:"
echo "docker-compose -f docker-compose.production.yml logs hr_backend"
echo ""
echo "And test the health endpoint:"
echo "curl http://localhost/health" 