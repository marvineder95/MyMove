#!/bin/bash

# MyMove Complete Startup Script
# ==============================
# Starts Backend + Frontend + Database

set -e

echo "🚀 Starting MyMove Platform..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

echo "🔧 Building and starting all services..."
echo ""

# Build and start services
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to be healthy..."
echo ""

# Wait for MySQL
while ! docker-compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; do
    echo "  Waiting for MySQL..."
    sleep 2
done
echo -e "${GREEN}✅ MySQL is ready${NC}"

# Wait for Backend
echo "  Waiting for Backend..."
for i in {1..60}; do
    if curl -s http://localhost:${BACKEND_PORT:-8080}/api/v1/ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready${NC}"
        break
    fi
    echo "    Attempt $i/60..."
    sleep 2
done

# Wait for Frontend
echo "  Waiting for Frontend..."
for i in {1..30}; do
    if curl -s http://localhost:${FRONTEND_PORT:-80} > /dev/null 2>&1 || \
       curl -s -I http://localhost:${FRONTEND_PORT:-80} 2>/dev/null | grep -q "HTTP"; then
        echo -e "${GREEN}✅ Frontend is ready${NC}"
        break
    fi
    echo "    Attempt $i/30..."
    sleep 2
done

echo ""
echo -e "${GREEN}🎉 MyMove Platform is running!${NC}"
echo ""
echo -e "${BLUE}📋 Service URLs:${NC}"
echo "   Frontend:    http://localhost:${FRONTEND_PORT:-80}"
echo "   Backend API: http://localhost:${BACKEND_PORT:-8080}"
echo "   API Health:  http://localhost:${BACKEND_PORT:-8080}/api/v1/ping"
echo ""
echo -e "${BLUE}🔑 Default Login:${NC}"
echo "   Admin: admin@mymove.at / admin123"
echo ""
echo -e "${BLUE}📚 Useful Commands:${NC}"
echo "   View logs:     docker-compose logs -f"
echo "   Backend logs:  docker-compose logs -f backend"
echo "   Frontend logs: docker-compose logs -f frontend"
echo "   Stop all:      ./stop.sh"
echo "   Reset data:    ./stop.sh -v"
echo ""
echo -e "${BLUE}🧪 Quick Test:${NC}"
echo "   curl http://localhost:${BACKEND_PORT:-8080}/api/v1/ping"
echo ""
