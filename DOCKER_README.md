# MyMove Backend - Docker Setup

Diese Anleitung hilft dir, das MyMove Backend mit Docker zu starten.

## 📋 Voraussetzungen

- [Docker](https://docs.docker.com/get-docker/) installiert
- [Docker Compose](https://docs.docker.com/compose/install/) installiert
- Ports 3306 (MySQL) und 8080 (Backend) verfügbar

## 🚀 Schnellstart

### 1. Environment konfigurieren

```bash
# Kopiere die Beispiel-Konfiguration
cp .env.example .env

# Optional: Bearbeite .env für Produktion
nano .env
```

### 2. Backend starten

```bash
# Alles automatisch starten
./start.sh
```

Oder manuell:

```bash
# Services bauen und starten
docker-compose up --build -d

# Logs anzeigen
docker-compose logs -f backend
```

### 3. Überprüfen

```bash
# Health Check
curl http://localhost:8080/api/v1/ping

# Antwort sollte "pong" oder ähnlich sein
```

## 🛑 Backend stoppen

```bash
# Nur Services stoppen
./stop.sh

# Services + Daten löschen
./stop.sh -v
```

## 🔧 Nützliche Befehle

```bash
# Container Status prüfen
docker-compose ps

# Backend Logs ansehen
docker-compose logs -f backend

# MySQL Logs ansehen
docker-compose logs -f mysql

# In den Backend-Container gehen
docker-compose exec backend sh

# In die MySQL-Datenbank verbinden
docker-compose exec mysql mysql -u mymove -p mymove
```

## 📂 Volumes (Persistente Daten)

| Volume | Pfad | Beschreibung |
|--------|------|--------------|
| `mysql_data` | `/var/lib/mysql` | Datenbank |
| `video_data` | `/app/data/videos` | Hochgeladene Videos |
| `upload_data` | `/app/uploads/trade-licenses` | Gewerbescheine |

## 🔑 Standard-Zugangsdaten

**Admin:**
- Email: `admin@mymove.at`
- Passwort: `admin123`

**Datenbank:**
- Host: `localhost:3306`
- User: `mymove`
- Passwort: `mymove`
- Datenbank: `mymove`

## 🧪 API Test

```bash
# Health Check
curl http://localhost:8080/api/v1/ping

# Als Admin einloggen (Basic Auth)
curl -u admin@mymove.at:admin123 http://localhost:8080/api/v1/admin/companies
```

## 🔧 Konfiguration

Alle Einstellungen können in `.env` angepasst werden:

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `SPRING_PROFILES_ACTIVE` | Aktive Profile | `docker,mock-ai` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | DB Schema Modus | `update` |
| `MYMOVE_ADMIN_PASSWORD` | Admin Passwort | `admin123` |
| `BACKEND_PORT` | Backend Port | `8080` |

## 🐛 Problembehebung

### Port bereits belegt
```bash
# Prüfen was Port 8080 belegt
lsof -i :8080

# Oder Port in .env ändern
BACKEND_PORT=8081
```

### Container startet nicht
```bash
# Alles zurücksetzen
docker-compose down -v
docker-compose up --build -d
```

### Datenbank-Verbindungsfehler
```bash
# MySQL Health Check
docker-compose exec mysql mysqladmin ping

# Wartezeit erhöhen in start.sh
```

## 📚 Weitere Dokumentation

- [API Übersicht](docs/API.md) (falls vorhanden)
- [Architektur](docs/DECISIONS.md)
- [Backend README](backend/README.md)
