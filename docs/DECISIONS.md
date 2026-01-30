# DECISIONS.md – MyMove (ADR light)

Dieses Dokument hält Architektur- und Produktentscheidungen fest, um Diskussionen zu verkürzen und Konsistenz zu sichern.

Format:
- **ID / Datum**
- **Entscheidung**
- **Status**
- **Kontext**
- **Begründung**
- **Konsequenzen**
- **Alternativen**

---

## ADR-001 / 2026-01-30 – Tech-Stack Gesamt

**Entscheidung:**  
Frontend: Vue 3 + TypeScript + Pinia  
Backend: Java 21 + Spring Boot  
AI-Service: Python + YOLOv8 + FastAPI  
Infra lokal: Docker + Docker Compose

**Status:** Accepted

**Kontext:**  
MyMove benötigt Video-Upload, asynchrone Analyse, B2C/B2B Plattform, Preislogik, Admin-Panel, langfristige Skalierung.

**Begründung:**
- Vue 3 + TS: schneller UI-Output, gute Wartbarkeit.
- Spring Boot: Production-grade Struktur, starke Domain-/Pricing-Logik, Security, Validierung.
- Python AI-Service: schnellste & flexibelste ML-Umsetzung, entkoppelt vom Backend.
- Docker: reproduzierbare Dev-Umgebung, Multi-Service-Setup ohne Chaos.

**Konsequenzen:**
- Multi-Repo oder Mono-Repo mit getrennten Ordnern möglich; Services bleiben logisch getrennt.
- Dev-Setup via `docker-compose up` muss Standard werden.

**Alternativen:**  
Node.js Backend, Monolith ohne AI-Service-Trennung, kein Docker (verworfen wegen Struktur-/Wartbarkeitsrisiko).

---

## ADR-002 / 2026-01-30 – Datenbank: MySQL

**Entscheidung:**  
Persistenz: **MySQL** (via JPA/Hibernate)

**Status:** Accepted

**Kontext:**  
Relationale Daten: Users, Companies, Requests, Offers, Pricing Rules, Buchungen.

**Begründung:**
- Stabil, verbreitet, gut hostbar, ausreichend für MyMove-Domäne.
- Gute Transaktions- und Index-Fähigkeiten.

**Konsequenzen:**
- SQL-Features werden DB-neutral gehalten (keine PG-spezifischen Features).
- Migrationstool (Flyway/Liquibase) wird benötigt.

**Alternativen:**  
PostgreSQL (verworfen: keine zwingenden Vorteile für MVP/Phase 1).

---

## ADR-003 / 2026-01-30 – Schichtenarchitektur (verbindlich)

**Entscheidung:**  
Verbindliches Layering:
- Controller
- DTO
- Service
- Repository
- Application (Use Cases)
- Domain
- Infrastructure

**Status:** Accepted

**Kontext:**  
Production-grade Start, minimierte technische Schulden, klare Verantwortlichkeiten.

**Begründung:**
- Entkopplung von API, Business, Persistenz.
- Testbarkeit (Use Cases isoliert).
- Skalierbarkeit (B2B/B2C Features wachsen ohne Spaghetti).

**Konsequenzen:**
- Keine Business-Logik in Controller/DTO/Repository.
- Use Cases sind der einzige Entry-Point für Domain-Operationen.
- DTO ≠ Domain-Model.

**Alternativen:**  
„Service-only“-Architektur (verworfen: wird schnell unstrukturiert).

---

## ADR-004 / 2026-01-30 – KI als separater Service (kein KI-Code im Backend)

**Entscheidung:**  
Videoanalyse läuft ausschließlich im **Python AI-Service**. Backend orchestriert nur.

**Status:** Accepted

**Kontext:**  
ML-Bibliotheken, GPU-Abhängigkeiten, Training/Inference-Zyklen, Skalierung.

**Begründung:**
- Unabhängige Deployments & Skalierung.
- ML-Stack bleibt flexibel.
- Backend bleibt stabil & security-fokussiert.

**Konsequenzen:**
- Backend kommuniziert via HTTP (FastAPI) oder später Queue.
- AI-Service liefert strukturierte Analyse-Resultate + Confidence.

**Alternativen:**  
KI im Spring Boot Prozess (verworfen: Komplexität, Deployment- & Runtime-Risiko).

---

## ADR-005 / 2026-01-30 – Asynchrone Videoanalyse

**Entscheidung:**  
Videoanalyse ist **asynchron**: Upload erzeugt Job, Status kann abgefragt werden.

**Status:** Accepted

**Kontext:**  
Videoanalyse dauert Sekunden bis Minuten; UI muss responsiv bleiben.

**Begründung:**
- Bessere UX, robust gegen Timeouts.
- Skalierbar für viele gleichzeitige Analysen.

**Konsequenzen:**
- Entities/States: `AnalysisJob` (PENDING/RUNNING/SUCCEEDED/FAILED).
- Frontend Polling oder später Webhooks/SSE.

**Alternativen:**  
Synchronous Analyse im Request-Response (verworfen: Timeouts/UX).

---

## ADR-006 / 2026-01-30 – KI-Ergebnis ist Vorschlag, Kunde korrigiert verpflichtend

**Entscheidung:**  
AI liefert **Vorschlagsliste**; UI muss Editieren ermöglichen (Remove/Add/Quantity).

**Status:** Accepted

**Kontext:**  
Erkennungsfehler sind unvermeidbar, Vertrauen ist kritisch.

**Begründung:**
- Transparenz schlägt Perfektion.
- Haftungsrisiko sinkt.
- Kunden behalten Kontrolle.

**Konsequenzen:**
- Datenmodell braucht `confidence` + `source` (AI/manual).
- UI: „Unsicher erkannt“ markieren.

**Alternativen:**  
„AI entscheidet final“ (verworfen: Vertrauen/Haftung).

---

## ADR-007 / 2026-01-30 – Preis: zuerst Schätzung, final nach Firmenbestätigung

**Entscheidung:**  
System zeigt initial **Preisspanne/Schätzung**; finaler Preis wird von Firma bestätigt.

**Status:** Accepted

**Kontext:**  
Umzugspreise hängen von Details ab, nicht alle Daten sind aus Video ableitbar.

**Begründung:**
- Reduziert Reklamationen/Nachverhandlungen.
- Verhindert falsche Fixpreis-Versprechen.

**Konsequenzen:**
- Pricing Output unterscheidet: `estimate` vs `final_offer`.
- Firma kann Angebot anpassen, Änderungen werden protokolliert.

**Alternativen:**  
Fixpreis sofort (verworfen: Risiko/Fehleranfälligkeit).

---

## ADR-008 / 2026-01-30 – Rollenmodell (MVP)

**Entscheidung:**  
Rollen: `CUSTOMER`, `COMPANY`, `ADMIN`.

**Status:** Accepted

**Kontext:**  
B2C + B2B + Plattformbetrieb.

**Begründung:**
- Klare Berechtigungen für MVP.
- Einfach erweiterbar (z. B. `COMPANY_STAFF` später).

**Konsequenzen:**
- Spring Security RBAC von Beginn an.
- Admin-Endpoints strikt getrennt.

**Alternativen:**  
Keine Rollen im MVP (verworfen: Security & B2B zwingend).

---

## ADR-009 / 2026-01-30 – Dateispeicherung (MVP)

**Entscheidung:**  
MVP: Video-Dateien lokal/volume-basiert (Docker Volume).  
Später: S3-kompatibler Storage.

**Status:** Proposed (für MVP angenommen, kann sich ändern)

**Kontext:**  
Schneller Start ohne Cloud-Abhängigkeit, später skalierbar.

**Begründung:**
- Einfaches Dev-Setup.
- Späterer Wechsel möglich über Storage-Abstraktion.

**Konsequenzen:**
- `StorageService` Interface im Backend.
- Metadaten in DB, Datei im Volume.

**Alternativen:**  
Direkt S3 (verworfen: Setup-Komplexität im MVP).

---

## ADR-010 / 2026-01-30 – API Versionierung

**Entscheidung:**  
Alle Endpoints unter `/api/v1`.

**Status:** Accepted

**Kontext:**  
Langfristige Plattform, B2B Integrationen möglich.

**Begründung:**
- Breaking Changes kontrollierbar.

**Konsequenzen:**
- DTOs versioniert/kompatibel halten.

**Alternativen:**  
Keine Versionierung (verworfen).

---