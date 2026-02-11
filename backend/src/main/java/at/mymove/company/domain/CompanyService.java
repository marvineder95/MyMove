package at.mymove.company.domain;

/**
 * Dienstleistungen, die eine Umzugsfirma anbieten kann.
 * Wird bei der Registrierung ausgewählt (Mehrfachauswahl).
 */
public enum CompanyService {

    MOVING,                 // klassische Umzüge
    CLEARANCE,              // Entrümpelungen
    EVICTION_CLEARANCE,     // Räumungen (z. B. Wohnungsauflösungen)
    HOARDER_CLEARANCE,      // Messi-Räumungen
    PIANO_TRANSPORT,        // Klaviertransport
    SPECIAL_TRANSPORT,      // Sonder-/Schwertransporte
    PACKING_SERVICE,        // Ein- / Auspackservice
    FURNITURE_ASSEMBLY,     // Möbelmontage / Demontage
    STORAGE_SERVICE         // Zwischenlagerung
}