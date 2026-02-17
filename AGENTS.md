# AGENTS.md – MyMove

Dieses Dokument enthält alle relevanten Informationen für AI Coding Agents, die am MyMove-Projekt arbeiten. Es dient als zentrale Referenz für Architektur, Technologien, Konventionen und Entwicklungsprozesse.

---

## 1. Projektübersicht

**MyMove** ist eine digitale Umzugsplattform, die KI-basierte Videoanalyse nutzt, um automatisiert Umzugsinventar zu erkennen und darauf basierend Preisangebote von Umzugsfirmen zu berechnen und vergleichbar zu machen.

### Kernziele
- Schnelle, transparente Umzugsangebote für Endkunden (B2C)
- Vergleichbarkeit von Umzugsfirmen
- Reduktion des Angebotsaufwands auf Firmenseite (B2B)
- Skalierbares Plattformmodell

### Grundprinzipien
- **KI unterstützt – entscheidet nicht**: KI liefert Vorschläge mit Confidence-Level, Kunden können alles korrigieren
- **Transparenz schlägt Perfektion**: Keine "magischen" KI-Entscheidungen ohne Nutzerkontrolle
- **Datenschutz hat Priorität**: Videos werden nur temporär gespeichert und nach Angebotsversand gelöscht
- **Erst korrekt, dann schnell**: Production-grade Code von Anfang an

---

## 2. Technologie-Stack

### Frontend
| Komponente | Technologie | Version |
|------------|-------------|---------|
| Framework | Vue 3 | ^3.4.0 |
| Language | TypeScript | ^5.3.0 |
| Build Tool | Vite | ^5.0.0 |
| State Management | Pinia | ^2.1.0 |
| HTTP Client | Axios | ^1.6.0 |
| Styling | Tailwind CSS | ^3.4.0 |
| Icons | @heroicons/vue | ^2.2.0 |
| i18n | vue-i18n | ^9.9.0 |
| Routing | vue-router | ^4.2.0 |

### Backend
| Komponente | Technologie | Version |
|------------|-------------|---------|
| Language | Java | 21 (LTS) |
| Framework | Spring Boot | 3.4.2 |
| Web | Spring Web | - |
| Security | Spring Security | - |
| Persistence | Spring Data JPA | - |
| Database | MySQL | 8.4 |
| Validation | Jakarta Validation | - |
| Build Tool | Maven | 3.9+ |

### Geplant: AI-Service
| Komponente | Technologie |
|------------|-------------|
| Language | Python |
| Framework | FastAPI |
| ML | YOLOv8 (Object Detection) |

### Infrastruktur
- **Containerisierung**: Docker & Docker Compose
- **Web Server**: Nginx (Frontend-Production)
- **Local Development**: Vollständig containerisiert

---

## 3. Projektstruktur

```
MyMove/
├── frontend/                 # Vue 3 SPA
│   ├── src/
│   │   ├── components/       # Vue-Komponenten
│   │   │   ├── Forms/        # Formularkomponenten
│   │   │   ├── Layout/       # Layout-Komponenten
│   │   │   └── UI/           # UI-Komponenten
│   │   ├── stores/           # Pinia Stores
│   │   ├── views/            # Page-Level Views
│   │   ├── router/           # Vue Router Konfiguration
│   │   ├── locales/          # i18n Übersetzungen (de/en)
│   │   └── types/            # TypeScript Type-Definitionen
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                  # Spring Boot Application
│   ├── src/main/java/at/mymove/
│   │   ├── auth/             # Authentifizierung
│   │   ├── company/          # Firmen-Management
│   │   ├── core/             # Core-Komponenten
│   │   ├── infrastructure/   # Infrastruktur (Security, Config)
│   │   ├── move/             # Umzugsdomäne (Address, MoveDetails)
│   │   ├── offer/            # Angebotslogik
│   │   └── video/            # Video-Handling
│   ├── src/main/resources/
│   │   └── application.yml   # Spring Konfiguration
│   ├── src/test/
│   ├── Dockerfile
│   └── pom.xml
│
├── ai-service/               # (Noch leer - für KI-Service)
├── docker/                   # (Noch leer - Docker-Helpers)
├── docs/                     # Projektdokumentation
│   ├── MASTERPROMPT.md       # Projekt-Master-Prompt
│   ├── SYSTEMPROMPT.md       # AI-Agent System-Prompt
│   ├── DECISIONS.md          # Architekturentscheidungen (ADR)
│   ├── ROADMAP.md            # Entwicklungs-Roadmap
│   └── PROGRESS.md           # Aktueller Implementationsstand
└── docker-compose.yml        # Lokale Entwicklungsumgebung
```

---

## 4. Backend-Architektur (Clean Architecture)

### Schichten-Struktur
Jedes Modul folgt der Clean Architecture mit strikter Trennung:

```
modul/
├── api/                      # REST API Layer
│   ├── Controller.java       # REST Endpoints
│   └── dto/                  # Request/Response DTOs
│
├── application/              # Application Layer (Use Cases)
│   ├── XxxUseCase.java       # Ein Use Case pro Klasse
│   └── XxxRepository.java    # Domain Repository Interface
│
├── domain/                   # Domain Layer (reine Business-Logik)
│   ├── DomainEntity.java     # Immutable Domain Objects
│   └── DomainService.java    # Domain Services
│
└── infrastructure/           # Infrastructure Layer
    └── persistence/          # JPA Implementierung
        ├── JpaEntity.java    # JPA Entity
        ├── JpaRepository.java
        ├── Mapper.java       # Domain ↔ JPA Mapping
        └── RepositoryImpl.java
```

### Wichtige Regeln
1. **Keine Business-Logik in Controllern, DTOs oder Repositories**
2. **Use Cases sind der einzige Entry-Point für Domain-Operationen**
3. **DTOs ≠ Domain-Model**: Strikte Trennung zwischen API- und Domain-Modellen
4. **Infrastructure ist austauschbar**: DB, Messaging, externe Services

### Beispiel: Offer-Modul
- `OfferController` → REST Endpoints unter `/api/v1/offers`
- `CreateOfferUseCase` → Orchestriert Offer-Erstellung
- `Offer` (Domain) → Immutable Record mit Validierung
- `OfferJpaEntity` → JPA Entity mit JSON-Konverter für MoveDetails

---

## 5. Build & Development Commands

### Frontend

```bash
cd frontend

# Development Server (Port 5173)
npm run dev

# Production Build
npm run build

# Type-Checking
npm run type-check

# Linting
npm run lint

# Preview Production Build
npm run preview
```

### Backend

```bash
cd backend

# Run with Maven Wrapper
./mvnw spring-boot:run

# Run Tests
./mvnw test

# Package (creates JAR)
./mvnw package -DskipTests

# Clean Build
./mvnw clean package
```

### Docker Compose (Empfohlen für Entwicklung)

```bash
# Start all services (MySQL + Backend)
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f mysql

# Stop all services
docker-compose down

# Reset (löscht auch Daten)
docker-compose down -v
```

### Services nach Docker-Start
| Service | URL | Beschreibung |
|---------|-----|--------------|
| Backend API | http://localhost:8080 | Spring Boot REST API |
| MySQL | localhost:3306 | Datenbank |

---

## 6. API-Konventionen

### REST Endpoints
- **Versionierung**: Alle Endpoints unter `/api/v1/`
- **HTTP Methods**: REST-konform (GET, POST, PATCH, DELETE)
- **Status Codes**: Korrekte HTTP-Status-Codes verwenden (201 CREATED, 404 NOT FOUND, etc.)

### Wichtige Endpoints

```
# Public
POST   /api/v1/auth/register          # Firmen-Registrierung
POST   /api/v1/auth/login             # Login
GET    /api/v1/ping                   # Health Check
POST   /api/v1/offers                 # Offer erstellen (Public)

# Authenticated (COMPANY)
GET    /api/v1/offers                 # Eigene Offers
GET    /api/v1/offers/{id}            # Offer-Details
POST   /api/v1/offers/{id}/send       # Offer versenden

# Authenticated
PATCH  /api/v1/offers/{id}/assign-company

# Admin
GET    /api/v1/admin/companies/pending
POST   /api/v1/admin/companies/{id}/approve
POST   /api/v1/admin/companies/{id}/reject
```

### Security
- **Authentifizierung**: HTTP Basic Auth (aktuell)
- **Rollen**: `CUSTOMER`, `COMPANY`, `ADMIN`
- **Annotation**: `@PreAuthorize("hasRole('COMPANY')")` für Rollen-Checks

---

## 7. Datenmodell (Wichtige Entities)

### Offer
```java
record Offer(
    UUID id,
    OfferStatus status,      // DRAFT, READY_TO_SEND, SENT, FAILED
    UUID videoId,
    UUID companyId,          // Optional (später zugewiesen)
    MoveDetails moveDetails,
    Instant createdAt,
    Instant sentAt
)
```

### Video
- Nur temporär gespeichert (ephemeral)
- Wird nach Angebotsversand automatisch gelöscht
- Keine Streaming/Download-Endpoints

### Company / UserAccount
- Firmen-Registrierung mit Genehmigungsprozess
- Rollen: `COMPANY`, `ADMIN`
- Trade License Upload (Gewerbeschein)

---

## 8. Code-Style Guidelines

### Java (Backend)
- **Java 21 Features**: Records für Domain-Objects, Pattern Matching wo sinnvoll
- **Lombok**: Verwenden für Boilerplate-Reduktion (@RequiredArgsConstructor)
- **Validierung**: Jakarta Validation für Input-Validierung
- **Immutability**: Domain-Objects sind immutable (Records)
- **Package-Struktur**: `at.mymove.modul.schicht`

### TypeScript (Frontend)
- **Composition API**: Vue 3 Composition API verwenden
- **Type Safety**: Strikte Typisierung, keine `any`
- **Stores**: Pinia mit Composition API Syntax
- **Path Aliases**: `@/` für `src/`-Imports

### Allgemein
- **Sprache**: Code-Kommentare und Dokumentation auf Deutsch
- **Logging**: Strukturiertes Logging mit Context
- **Fehlerbehandlung**: Explizite Error-Handling, keine silently caught errors

---

## 9. Testing Strategy

### Backend
```bash
# Unit Tests
./mvnw test

# Integration Tests
./mvnw verify
```

### Frontend
```bash
# Type Checking
npm run type-check

# Linting
npm run lint
```

### Test-Prinzipien
- Use Cases sind isoliert testbar (keine Spring-Context-Abhängigkeit)
- Domain-Logic ohne Framework-Abhängigkeiten testen

---

## 10. Deployment & Infrastruktur

### Docker Images
- **Backend**: Multi-Stage Build (Maven → JRE Runtime)
- **Frontend**: Multi-Stage Build (Node → Nginx)

### Konfiguration
- **Backend**: `application.yml` (Environment-spezifisch via env vars)
- **Frontend**: `.env` Dateien für Build-Zeit-Konfiguration

### Datenbank
- **MySQL 8.4** mit Docker Volume für Persistenz
- **DDL-Auto**: `update` (nur für Entwicklung!)
- **Migration**: Flyway oder Liquibase für Produktion (geplant)

---

## 11. Security Considerations

### Authentifizierung & Autorisierung
- HTTP Basic Auth (aktueller MVP-Status)
- BCrypt für Passwort-Hashing
- Rollenbasierte Zugriffskontrolle (RBAC)

### Datenschutz (DSGVO)
- Videos werden **nicht dauerhaft** gespeichert
- Automatische Löschung nach Angebotsversand oder 24h TTL
- Keine Video-Download/Streaming-Endpoints

### Input Validation
- Serverseitige Validierung obligatorisch
- DTOs mit Jakarta Validation Annotationen

---

## 12. Projektspezifische Konventionen

### Video-Handling Policy
- Videos sind **technische Hilfsmittel**, keine dauerhaften Domänenobjekte
- Löschung bei: `SendOfferUseCase` oder 24h TTL
- Storage-Interface ist austauschbar (lokal → S3)

### KI-Integration (Zukunft)
- KI-Service läuft **niemals** im Backend-Prozess
- Kommunikation über HTTP (FastAPI) oder Queue
- KI-Ergebnisse enthalten immer `confidence`-Level

### Preis-Logik
- Zuerst **Schätzung** (Estimate), dann **Finalangebot** nach Firmenbestätigung
- Keine automatischen Fixpreis-Garantien

---

## 13. Dokumentation im Projekt

| Datei | Zweck |
|-------|-------|
| `docs/MASTERPROMPT.md` | Gesamtprojekt-Überblick, Ziele, Vision |
| `docs/SYSTEMPROMPT.md` | AI-Agent Verhaltensregeln |
| `docs/DECISIONS.md` | Architekturentscheidungen (ADR Format) |
| `docs/ROADMAP.md` | Entwicklungsphasen und Milestones |
| `docs/PROGRESS.md` | Aktueller Implementationsstand |

---

## 14. Troubleshooting

### Häufige Probleme

**Backend startet nicht - DB Connection Error**
```bash
# Prüfen ob MySQL läuft
docker-compose ps

# Logs prüfen
docker-compose logs mysql
```

**Frontend Build fehlschlägt**
```bash
# node_modules neu installieren
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend && npm install
```

**Port bereits belegt**
- Backend: Port 8080
- MySQL: Port 3306
- Frontend Dev: Port 5173

---

## 15. Kontakt & Ressourcen

- **Projekt**: MyMove - Ihr Umzugspartner
- **Dokumentation**: Siehe `docs/` Verzeichnis
- **Architektur-Entscheidungen**: Siehe `docs/DECISIONS.md`

---

*Letzte Aktualisierung: 2026-02-17*
