#!/bin/bash

# MyMove Backend Stop Script
# ==========================
# Stops all MyMove services

set -e

echo "🛑 Stopping MyMove Backend..."

# Check for -v flag (remove volumes)
if [ "$1" == "-v" ] || [ "$1" == "--volumes" ]; then
    echo "⚠️  Removing volumes as well..."
    docker-compose down -v
    echo -e "\033[0;32m✅ All services stopped and volumes removed\033[0m"
else
    docker-compose down
    echo -e "\033[0;32m✅ All services stopped\033[0m"
    echo ""
    echo "To also remove data volumes, run:"
    echo "  ./stop.sh -v"
fi
