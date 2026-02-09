# MyMove – Implementation Progress

Stand: 2026-02-03  
Branch: main  
Status: Offer-Create stabil (201 CREATED)

---

## ✅ Meilensteine (neu)

- ✅ `POST /api/v1/offers` liefert **201 CREATED**
- ✅ Offer inkl. vollständiger MoveDetails wird:
  - validiert
  - gemappt (DTO → Domain → JPA)
  - persistiert (JSON via Converter)
- ✅ Status beim Anlegen: `DRAFT`
- ✅ End-to-End-Flow: API → Domain → Persistence → DB funktioniert stabil

---

## Architekturstatus

- Clean Architecture (Domain / Application / Infrastructure)
- Klare Modultrennung:
  - `video`
  - `offer`
- Keine Querverweise zwischen Modulen auf DB-/Entity-Ebene
- Kommunikation:
  - Offer referenziert Video **nur per `videoId`**
- Persistenz:
  - JPA + Hibernate
  - MySQL (Docker)
  - JSON-Serialisierung für komplexe Value Objects

---

## Modul: Video

### Implementiert
- Video Domain Entity
- VideoStatus Enum
- UploadVideoUseCase
- DeleteVideoUseCase
- VideoStorage (Local, austauschbar)
- JPA Persistence (Entity, Repository, Mapper)
- Transaktionale Upload-Logik
- Fehlerstatus bei Upload-Fehlschlag

### Bewusst NICHT implementiert
- ❌ Video-Streaming
- ❌ Video-Download
- ❌ Öffentliche Zugriffe auf Videos

### Lifecycle
- Video existiert nur temporär
- Wird nach Angebotsversand gelöscht  
  (siehe `DECISIONS.md`)

---

## Modul: Offer

### Implementiert
- Offer Domain Entity
- OfferStatus Enum
- OfferRepository (Domain Interface)
- CreateOfferUseCase
- SendOfferUseCase (Statuswechsel vorbereitet)
- REST API (Controller + DTOs)
- JPA Persistence:
  - OfferJpaEntity
  - Repository
  - Mapper
  - JSON Converter für MoveDetails

### Angebotslogik
- Offer wird vollständig aus Request-Daten erstellt
- Keine „später füllen wir das noch“-Felder
- Video-Ergebnisse (YOLO) werden **später** über Application Layer eingespeist
- Angebotsversand triggert Video-Löschung (Policy)

### Statusfluss
- `DRAFT`
- `READY_TO_SEND`
- `SENT`
- `FAILED`

---

## Infrastruktur

### Docker
- docker-compose für:
  - backend
  - mysql
- Netzwerk: `mymove_default`
- DB Hostname: `mysql`

### Backend
- Spring Boot 3.4.x
- Java 21
- Start über Docker stabil
- Port: `8080`

---

## ❌ Bewusst ausgeschlossen (MVP)

- Video-Streaming
- Video-Download
- Langfristige Video-Speicherung
- Angebotserstellung im Video-Modul
- Direkte DB-Zugriffe aus Controllern
- Auth / Security (kommt später)

---

## 🟡 Noch offen (bewusst verschoben)

### Angebotsdaten (bereits technisch möglich, fachlich noch ausbaubar)
- Zwischenstopps
- Zeitfenster / Flexibilität
- Kontaktinformationen
- Erweiterte Sonderanforderungen

### Authentifizierung & Rollen
- Unternehmens-Registrierung
- Login für Umzugsfirmen
- Rollen / Rechte
- Offer-Zuordnung zu Company

### KI / YOLO
- Objekterkennung aus Videos
- Ableitung von Inventar-Listen
- Integration **erst nach vollständiger Offer-Logik**

---

## 🔜 Nächste Schritte (priorisiert)

### 1) Offer-Flow erweitern (ohne Auth)
Ziel: vollständiger Angebotslebenszyklus ohne Security-Abhängigkeit.

- Endpoints:
  - `GET /api/v1/offers`
  - `GET /api/v1/offers/{id}`
  - `PATCH /api/v1/offers/{id}/ready-to-send`
  - `POST /api/v1/offers/{id}/send`
- SendOfferUseCase:
  - Status → `SENT`
  - triggert Video-Löschung

---

### 2) Company-Zuordnung vorbereiten (Platzhalter)
- Offer erhält optional `companyId`
- Noch **keine** Zugriffsbeschränkung
- Dient nur der späteren Migration zu Auth

---

### 3) Auth (erst danach)
- User / Company Login
- Rollen (ADMIN / COMPANY)
- Zugriff nur auf eigene Offers

---

### 4) YOLO Integration (ganz am Schluss)
- Liefert **Vorschläge**, keine Pflichtdaten
- Wird über Application Layer eingespeist
- Keine Kopplung an REST oder Persistence

---

## 🧠 Leitprinzip
> Erst **fachlich korrekt & stabil**,  
> dann **Security**,  
> dann **KI**.

Kein Schritt blockiert den nächsten.