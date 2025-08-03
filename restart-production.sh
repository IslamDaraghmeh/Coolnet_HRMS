#!/bin/bash

# Production Restart Script for HR Backend

echo "Restarting HR Backend services..."

# Stop services
./stop-production.sh

# Start services
./start-production.sh

echo "Services restarted successfully!"
