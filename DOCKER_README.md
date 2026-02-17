# MyMove - Docker Setup Guide

Complete Docker setup for MyMove platform with Backend, Frontend, and Database.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- Ports 80 (Frontend), 8080 (Backend), 3306 (MySQL) available

## 🚀 Quick Start

```bash
# 1. Clone/navigate to project
cd MyMove

# 2. Create environment file
cp .env.example .env

# 3. Start everything
./start.sh
```

**That's it!** The entire platform is now running.

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Vue 3 Web Application |
| **Backend API** | http://localhost:8080 | Spring Boot REST API |
| **API Health** | http://localhost:8080/api/v1/ping | Health Check Endpoint |
| **MySQL** | localhost:3306 | Database (if needed externally) |

## 🔑 Default Login

```
Admin: admin@mymove.at / admin123
```

## 🛠️ Configuration

### Environment Variables

Edit `.env` file to customize:

```bash
# Ports
MYSQL_PORT=3306
BACKEND_PORT=8080
FRONTEND_PORT=80

# Database
MYSQL_DATABASE=mymove
MYSQL_USER=mymove
MYSQL_PASSWORD=mymove

# Backend
MYMOVE_ADMIN_EMAIL=admin@mymove.at
MYMOVE_ADMIN_PASSWORD=admin123
SPRING_PROFILES_ACTIVE=docker,mock-ai

# Frontend API URL
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Changing Ports

If ports are already in use:

```bash
# Edit .env
FRONTEND_PORT=8081
BACKEND_PORT=8082
MYSQL_PORT=3307

# Restart
./stop.sh -v
./start.sh
```

## 📊 Services Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Docker Network                      │
│                                                         │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────┐ │
│   │   Frontend   │    │    Backend   │    │  MySQL   │ │
│   │   (Nginx)    │◄──►│  (Spring)    │◄──►│          │ │
│   │    :80       │    │    :8080     │    │  :3306   │ │
│   └──────────────┘    └──────────────┘    └──────────┘ │
│          │                                            │
│          └────────────────────────────────────────────┘
│                      localhost
└─────────────────────────────────────────────────────────┘
```

## 🧪 Testing the Stack

```bash
# 1. Health Check
curl http://localhost:8080/api/v1/ping

# 2. View Frontend
curl http://localhost

# 3. Login as Admin
curl -u admin@mymove.at:admin123 \
  http://localhost:8080/api/v1/admin/companies
```

## 📚 Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Restart Services
```bash
# Restart everything
./stop.sh
./start.sh

# Restart single service
docker-compose restart backend
```

### Enter Containers
```bash
# Backend shell
docker-compose exec backend sh

# MySQL CLI
docker-compose exec mysql mysql -u mymove -p mymove

# Frontend (Nginx) - read-only mostly
docker-compose exec frontend sh
```

### Reset Data (⚠️ Destructive)
```bash
# Remove everything including volumes
./stop.sh -v

# Fresh start
./start.sh
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 80
sudo lsof -i :80

# Kill process or change port in .env
```

### Frontend Can't Connect to Backend
```bash
# Check if backend is healthy
curl http://localhost:8080/api/v1/ping

# View frontend logs
docker-compose logs frontend

# Check network
docker network inspect mymove_mymove-network
```

### Build Fails
```bash
# Clear build cache
docker-compose build --no-cache

# Or full reset
docker-compose down -v
docker-compose up --build -d
```

### Database Connection Issues
```bash
# Check MySQL is running
docker-compose ps mysql

# Check MySQL logs
docker-compose logs mysql | tail -50

# Verify credentials
docker-compose exec mysql mysql -u mymove -p -e "SELECT 1"
```

## 🔧 Development Mode

### Frontend Hot Reload

For development with instant code changes:

```bash
# Edit docker-compose.yml
# Comment out 'frontend' service
# Uncomment 'frontend-dev' service

# Start
docker-compose up -d frontend-dev

# Access on http://localhost:5173
```

### Backend Debug Mode

```bash
# Set profile to dev
echo "SPRING_PROFILES_ACTIVE=dev" >> .env

# Restart backend
docker-compose restart backend
```

## 🚀 Production Deployment

### Basic Production Setup

1. **Change default passwords** in `.env`:
```bash
MYMOVE_ADMIN_PASSWORD=strong-password-here
MYSQL_ROOT_PASSWORD=strong-root-password
MYSQL_PASSWORD=strong-db-password
```

2. **Set production mode**:
```bash
SPRING_PROFILES_ACTIVE=docker,prod
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
```

3. **Use proper domain**:
```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

### Docker Swarm (Multi-Host)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml mymove

# Scale services
docker service scale mymove_backend=3
```

### HTTPS with Traefik

For production HTTPS, add Traefik to docker-compose:

```yaml
# Add to docker-compose.yml
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=your@email.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - letsencrypt:/letsencrypt
```

## 💾 Backup & Restore

### Backup Database
```bash
docker-compose exec mysql mysqldump -u mymove -p mymove > backup.sql
```

### Restore Database
```bash
docker-compose exec -T mysql mysql -u mymove -p mymove < backup.sql
```

### Backup Volumes
```bash
# Create backup
docker run --rm -v mymove_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup.tar.gz -C /data .

# Restore
docker run --rm -v mymove_mysql_data:/data -v $(pwd):/backup alpine tar xzf /backup/mysql_backup.tar.gz -C /data
```

## 📖 Additional Resources

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [API Documentation](docs/API.md)

---

**MyMove Platform - Docker Ready** 🐳🚀
