#!/bin/bash

# MyMove Backend Startup Script
# =============================
# This script starts the complete MyMove backend infrastructure

set -e

echo "🚀 Starting MyMove Backend..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please review and adjust .env file if needed${NC}"
    echo ""
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker first"
    exit 1
fi

echo "🔧 Building and starting services..."
echo ""

# Build and start services
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to be healthy..."
echo ""

# Wait for MySQL
while ! docker-compose exec -T mysql mysqladmin ping -h localhost --silent; do
    echo "  Waiting for MySQL..."
    sleep 2
done
echo -e "${GREEN}✅ MySQL is ready${NC}"

# Wait for Backend
echo "  Waiting for Backend..."
sleep 10

# Check if backend is responding
for i in {1..30}; do
    if curl -s http://localhost:8080/api/v1/ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready${NC}"
        break
    fi
    echo "    Attempt $i/30..."
    sleep 2
done

echo ""
echo -e "${GREEN}🎉 MyMove Backend is running!${NC}"
echo ""
echo "📋 Service URLs:"
echo "   Backend API: http://localhost:8080"
echo "   API Docs:    http://localhost:8080/api/v1/ping"
echo ""
echo "🔑 Default Login:"
echo "   Admin: admin@mymove.at / admin123"
echo ""
echo "📚 Useful Commands:"
echo "   View logs:      docker-compose logs -f backend"
echo "   Stop services:  docker-compose down"
echo "   Reset data:     docker-compose down -v"
echo ""
echo "🧪 Quick Test:"
echo "   curl http://localhost:8080/api/v1/ping"
echo ""
