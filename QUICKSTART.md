# MyMove - Quick Start Guide

🚀 **Starte die komplette Plattform in 3 Schritten:**

## 1. Environment vorbereiten

```bash
cp .env.example .env
```

## 2. Plattform starten

```bash
./start.sh
```

## 3. Im Browser öffnen

- **Frontend:** http://localhost
- **Backend API:** http://localhost:8080/api/v1/ping

---

## Standard Login

```
Email: admin@mymove.at
Passwort: admin123
```

---

## Wichtige Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `./start.sh` | Alles starten |
| `./stop.sh` | Alles stoppen |
| `./stop.sh -v` | Alles stoppen + Daten löschen |
| `docker-compose logs -f` | Live-Logs anzeigen |
| `docker-compose ps` | Status prüfen |

---

## Ports anpassen (falls belegt)

In `.env` Datei:

```bash
FRONTEND_PORT=8081
BACKEND_PORT=8082
MYSQL_PORT=3307
```

Dann neu starten:
```bash
./stop.sh -v
./start.sh
```

---

## Hilfe

Mehr Details findest du in [DOCKER_README.md](DOCKER_README.md)

**Fertig!** 🎉 Dein MyMove läuft jetzt komplett in Docker.
