# MyMove – Implementation Progress

Stand: 2026-02-02
Branch: main

## Architekturstatus

- Clean Architecture (Domain / Application / Infrastructure)
- Modulstruktur:
    - video
    - offer
- Kommunikation:
    - Offer referenziert Video nur per `videoId`
- Persistenz:
    - JPA + Hibernate
    - MySQL (Docker)

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
- Wird nach Angebotsversand gelöscht (siehe DECISIONS.md)

## Modul: Offer

### Implementiert
- Offer Domain Entity
- OfferStatus Enum
- OfferRepository (Domain Interface)
- CreateOfferUseCase
- SendOfferUseCase (inkl. Statuswechsel)
- REST API (Controller + DTOs)
- JPA Persistence (Entity, Repository, Mapper)

### Angebotslogik
- Offer wird aus Request-Daten erstellt
- Video-Ergebnisse (YOLO) werden später über Application Layer eingespeist
- Angebotsversand triggert Video-Löschung

### Statusfluss
- DRAFT
- READY_TO_SEND
- SENT
- FAILED

## Infrastruktur

### Docker
- docker-compose für:
    - backend
    - mysql
- Netzwerk: mymove_default
- DB Hostname: mysql

### Backend
- Spring Boot 3.4.x
- Java 21
- Start erfolgreich über Docker
- Port: 8080

## Nicht umsetzen (bewusst ausgeschlossen)

- Video-Streaming
- Video-Download
- Langfristige Video-Speicherung
- Angebotserstellung im Video-Modul
- Direkte DB-Zugriffe aus Controllern

## 🟡 Noch offen (bewusst verschoben)

### Angebotsdaten (Move Details)
- Adressen (von / nach / Zwischenstopps)
- Stockwerk, Aufzug, Distanz, Halteverbot
- Termin / Zeitfenster
- Kontaktinformationen
- Sonderanforderungen (Klavier, Montage, etc.)
  → werden im nächsten Schritt als Domain-ValueObjects ergänzt

### Authentifizierung
- Unternehmens-Registrierung
- Login für Umzugsfirmen
- Rollen / Rechte
- Offer-Zuordnung zu Company

### KI / YOLO
- Objekterkennung aus Videos
- Ableitung von Inventar-Listen
- Integration **erst nach vollständiger Offer-Logik**

## 🔜 Nächste Schritte (ab morgen)

### 1) Offer: Angebotsdaten sauber modellieren (Domain Value Objects)
Ziel: Offer bekommt alle Umzugsinfos **über Request**, ohne dass wir später alles umbauen müssen.

- Neue Domain-ValueObjects (Paket: at.mymove.offer.domain.*):
    - MoveRoute (from/to + optional Zwischenstopps)
    - MoveLocationDetails (Stockwerk, Aufzug, Distanz/Trageweg, Parkplatz/ Halteverbot)
    - MoveSchedule (Datum, Zeitfenster, Flexibilität)
    - ContactDetails (Name, Telefon, Email)
    - SpecialRequirements (Piano, Montage, Verpackung, etc.)
- Offer bekommt ein Feld wie `moveDetails` (oder einzelne Felder) und wird über Factory/Constructor vollständig befüllt.

### 2) Offer API: CreateOfferRequest erweitern + Mapping
- DTOs erweitern:
    - CreateOfferRequest enthält alle MoveDetails-Felder
    - CreateOfferResponse bleibt schlank (id, status, createdAt, sentAt, videoId)
- Controller → ruft CreateOfferUseCase → Domain wird aus Request vollständig gebaut (kein „TODO später“).

### 3) Offer UseCases: CRUD-Flow für Company vorbereiten (ohne Auth erstmal)
- Endpoints (MVP, ohne Login):
    - GET /api/v1/offers (Liste)
    - GET /api/v1/offers/{id} (Detail)
    - PATCH /api/v1/offers/{id}/ready-to-send
    - POST /api/v1/offers/{id}/send
- SendOfferUseCase:
    - Status -> SENT
    - triggert Video-Löschung (Policy aus DECISIONS)  [oai_citation:1‡DECISIONS.md](sediment://file_000000007a7c71f492014265070aa889)

### 4) Datenmodell: Offer <-> Company vorbereiten (Platzhalter)
- Offer erhält optional `companyId` (noch ohne Security)
- Später wird Filter/Access darüber gemacht, sobald Auth drin ist.

### 5) Danach erst: Auth (Company Registrierung/Login) und dann YOLO ganz am Schluss
- Auth kommt NACH vollständiger Offer-Logik
- YOLO liefert nur Inventory-Vorschläge und wird später über Application Layer eingespeist