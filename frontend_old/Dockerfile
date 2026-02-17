# ============================================
# MyMove Vue 3 - Multi-Stage Dockerfile
# Produktionsreifer Build für Umzugsplattform
# ============================================

# --------------------------------------------
# Stage 1: Build
# --------------------------------------------
FROM node:20-alpine AS build

# Build arguments for API configuration
ARG VITE_API_BASE_URL=http://localhost:8080/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package Files kopieren (für bessere Layer Caching)
COPY package*.json ./

# Dependencies installieren (dev dependencies included for build)
RUN npm install

# Quellcode kopieren
COPY . .

# Production Build erstellen
RUN npm run build

# --------------------------------------------
# Stage 2: Production
# --------------------------------------------
FROM nginx:alpine

# Labels für bessere Dokumentation
LABEL maintainer="MyMove Team"
LABEL app="mymove-frontend"
LABEL version="1.0.0"

# Build-Dateien aus Stage 1 kopieren
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx Konfiguration kopieren
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port 80 exposen
EXPOSE 80

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Nginx im Vordergrund starten
CMD ["nginx", "-g", "daemon off;"]
