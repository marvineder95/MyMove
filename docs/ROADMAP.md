# ROADMAP – MyMove MVP

Ziel:
Ein production-tauglicher MVP, der:
- echte Videos analysiert
- echte Angebote berechnet
- Kunden & Firmen zusammenbringt
- ohne Rewrite weiterentwickelbar ist

Kein Prototyp. Kein Wegwerf-Code.

---

## PHASE 0 – Fundament (Woche 0)

Status: ✅ abgeschlossen

- Projektstruktur angelegt
- MASTERPROMPT.md erstellt
- SYSTEMPROMPT.md erstellt
- DECISIONS.md erstellt
- Tech-Stack festgelegt
- Architektur-Grundprinzipien fixiert

---

## PHASE 1 – Backend-Grundgerüst (Woche 1–2)

### Ziele
- Backend lauffähig
- Security & Rollen definiert
- Keine Business-Logik, aber vollständige Struktur

### Tasks
- Spring Boot Projekt initialisieren
- Layer-Struktur umsetzen:
    - controller
    - dto
    - service
    - repository
    - application
    - domain
    - infrastructure
- MySQL-Anbindung
- Flyway/Liquibase einrichten
- Basis-Security:
    - Rollen: CUSTOMER / COMPANY / ADMIN
    - Login / Registration (minimal)
- Docker Compose:
    - backend
    - mysql

### Ergebnis
- Leeres, aber sauberes Backend
- DB migrationsfähig
- Security funktionsfähig

---

## PHASE 2 – Kern-Domäne & Datenmodell (Woche 2–3)

### Ziele
- Domäne steht
- Alle Kern-Entities definiert
- Noch kein UI-Fokus

### Kern-Entities
- User
- Company
- CompanyProfile
- VideoUpload
- AnalysisJob
- InventoryItem
- Offer
- PricingRule

### Tasks
- Domain-Model sauber modellieren
- Use Cases (Application Layer):
    - UploadVideo
    - StartAnalysis
    - GetAnalysisStatus
    - UpdateInventory
    - CalculateOffer
- Repositories implementieren
- DTOs definieren (API v1)

### Ergebnis
- Stabile Domänenbasis
- Use-Case-zentrierte Architektur

---

## PHASE 3 – KI-Integration (Woche 3–4)

### Ziele
- Video → Analyse → Inventar
- Asynchron, robust

### Tasks
- AI-Service (FastAPI) als Docker-Service
- Analyse-Endpunkt:
    - POST /analyze
    - GET /status/{jobId}
- Backend ↔ AI-Service Kommunikation
- AnalysisJob-State-Machine:
    - PENDING
    - RUNNING
    - SUCCEEDED
    - FAILED
- Persistenz der KI-Ergebnisse
- Confidence-Level speichern

### Ergebnis
- Echte Videoanalyse integriert
- Backend bleibt stabil & entkoppelt

---

## PHASE 4 – Pricing & Angebotslogik (Woche 4–5)

### Ziele
- Preise berechenbar
- Firmen-Logik berücksichtigt

### Tasks
- PricingRule-Modell:
    - Preis pro Item
    - Preis pro Volumen
    - Zuschläge (Stockwerk, Distanz, etc.)
- CalculateOffer Use Case
- Preisarten:
    - Estimate
    - FinalOffer
- Firmen können Angebot bestätigen/anpassen
- Änderungs-Historie speichern

### Ergebnis
- Wirtschaftlich nutzbares System
- Kein Dummy-Pricing

---

## PHASE 5 – Frontend MVP (Woche 5–7)

### Ziele
- End-to-End Flow sichtbar
- Fokus auf Geschwindigkeit & Klarheit

### Kunden-Flow
- Video hochladen
- Analyse-Status sehen
- Inventarliste bearbeiten
- Preisangebote sehen
- Firma auswählen

### Firmen-Flow
- Registrierung
- Login
- Angebotsübersicht
- Angebotsbearbeitung

### Tasks
- Vue 3 Projekt
- Auth-Handling
- Upload-UI
- Inventar-Editor
- Angebots-UI
- API-Integration

### Ergebnis
- Nutzbarer MVP
- Kein Design-Fokus, aber klar & verständlich

---

## PHASE 6 – Stabilisierung & MVP-Launch (Woche 7–8)

### Ziele
- Fehlerarm
- Demo-tauglich
- Testkundenfähig

### Tasks
- Error-Handling
- Edge-Cases (leeres Video, Abbruch, etc.)
- Logging
- Simple Monitoring
- Seed-Daten für Firmen
- Dokumentation (API + Setup)

### Ergebnis
- MVP bereit für:
    - echte Firmen
    - echte Kunden
    - Feedback

---

## PHASE 7 – Nach MVP (optional)

Nicht Teil des MVP, aber vorbereitet:

- Zahlungen
- Kalender / Kapazitäten
- Custom KI-Training
- Internationalisierung
- Mobile Optimierung

---

## Leitprinzip für alle Phasen

- Jede Phase endet mit:
    - lauffähigem Zustand
    - commitbarem Code
    - keiner halbfertigen Logik