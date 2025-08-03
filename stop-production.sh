#!/bin/bash

# Production Stop Script for HR Backend

echo "Stopping HR Backend services..."

# Stop all containers
docker-compose -f docker-compose.production.yml down

echo "All services stopped successfully!"
