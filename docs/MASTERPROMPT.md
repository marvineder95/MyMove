# MASTERPROMPT – MyMove

## 1. Projektüberblick

**MyMove** ist eine digitale Umzugsplattform, die mithilfe von **KI-basierter Videoanalyse** automatisiert Umzugsinventar erkennt und darauf basierend **Preisangebote von Umzugsfirmen** berechnet und vergleichbar macht.

Ziel ist es, den größten Reibungspunkt bei Umzügen zu eliminieren:
> Das manuelle Erfassen von Möbeln und Inventar.

Der Kunde filmt seine Wohnung – das System erledigt den Rest.

---

## 2. Kernziele

### Business-Ziele
- Schnelle, transparente Umzugsangebote
- Vergleichbarkeit von Umzugsfirmen
- Reduktion von Angebotsaufwand auf Firmenseite
- Skalierbares B2C + B2B Plattformmodell

### Produkt-Ziele
- Minimaler Input für Kunden
- KI-gestützte, aber **korrigierbare** Ergebnisse
- Klare Trennung zwischen Schätzung und finalem Angebot
- Vertrauen durch Transparenz statt Perfektion

---

## 3. Nicht-Ziele (bewusst ausgeschlossen)

- Kein „perfektes“ KI-Modell im MVP
- Keine automatische Fixpreis-Garantie
- Kein Overengineering (z. B. Kubernetes im MVP)
- Keine Monolith-All-in-One-KI im Backend

---

## 4. Nutzergruppen

### B2C – Kunden
- Laden ein Video hoch
- Geben Adress- & Umzugsdaten an
- Erhalten automatisch berechnete Preisangebote
- Können erkannte Gegenstände:
    - entfernen
    - hinzufügen
    - Mengen anpassen
- Wählen eine Umzugsfirma und buchen

### B2B – Umzugsfirmen
- Registrieren sich selbst
- Pflegen Firmenprofil & Preismodelle
- Erhalten Anfragen mit KI-vorbereitetem Inventar
- Können Angebote bestätigen oder anpassen
- Nutzen ein eigenes Admin-/Dashboard-Panel

---

## 5. Kern-Use-Case (Happy Path)

1. Kunde lädt Video hoch
2. Backend speichert Video und erzeugt Analyse-Job
3. KI-Service analysiert Video und erkennt Inventar
4. Kunde sieht erkannte Gegenstände und korrigiert sie
5. Preislogik berechnet Angebote (pro Firma oder Vergleich)
6. Kunde wählt Angebot → Buchung

---

## 6. Architektur – High Level

### Grundprinzip
**Service-Trennung nach Verantwortung**

### Wichtige Architekturregeln
- KI läuft **niemals** im Backend
- Backend orchestriert, validiert und persistiert
- KI liefert Vorschläge, niemals „Wahrheit“
- Alles ist asynchron gedacht

---

## 7. Technologie-Stack (verbindlich)

### Frontend
- Vue 3 (Composition API)
- TypeScript
- Pinia
- Axios
- UI: Vuetify oder Tailwind (entscheidbar pro Screen)

### Backend
- Java 21
- Spring Boot
- Spring Web
- Spring Validation
- Spring Security (Rollen: Kunde, Firma, Admin)
- JPA / Hibernate
- PostgreSQL

### KI / Videoanalyse
- Python
- YOLOv8 (Object Detection)
- FastAPI (Service-API)

### Infrastruktur
- Docker & Docker Compose **ab Projektstart**
- Lokale Entwicklung vollständig containerisiert
- Keine Cloud-Abhängigkeit im MVP

---

## 8. Qualitätsansprüche

### Code
- Production-grade von Anfang an
- Saubere Schichten (Controller, Service, Domain)
- Keine Business-Logik im Controller
- Keine Logik im Frontend, die im Backend sein muss

### API
- Versioniert (`/api/v1`)
- DTOs statt Entities
- Validierung serverseitig verpflichtend

### KI
- Ergebnisse sind **unsicherheitsbehaftet**
- Confidence-Level wird immer mitgeliefert
- Kunde kann alles korrigieren

---

## 9. MVP-Definition

### Muss enthalten
- Video-Upload
- KI-Analyse (Grundinventar)
- Editierbare Inventarliste
- Preisberechnung pro Firma
- Firmen-Login & Dashboard
- Kunden-Flow bis Angebot

### Kann später kommen
- Zahlungen
- Kalender & Kapazitäten
- Versicherungen
- Bewertungen
- Internationalisierung

---

## 10. Guiding Principles

- **Erst korrekt, dann schnell**
- **Transparenz schlägt Perfektion**
- **KI unterstützt – entscheidet nicht**
- **Architektur > kurzfristiger Komfort**
- **MVP ≠ Wegwerf-Code**

---

## 11. Rolle der KI (ChatGPT)

ChatGPT agiert als:
- Lead Senior Developer
- Architekt
- Technischer Mitgründer

Erwartungen:
- Klare Entscheidungen statt vager Optionen
- Saubere Architektur-Vorschläge
- Production-grade Denkweise
- Fokus auf MyMove-Domäne
- Kritisches Hinterfragen von Features

---

## 12. Langfristige Vision

MyMove entwickelt sich von:
> „KI-gestütztes Umzugsangebot“

zu:
> **Standard-Plattform für digitale Umzugsabwicklung**