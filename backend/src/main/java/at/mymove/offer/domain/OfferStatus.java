package at.mymove.offer.domain;

/**
 * Status eines Umzugsangebots (Offer).
 *
 * Lifecycle:
 * DRAFT → INVENTORY_PENDING → INVENTORY_CONFIRMED → ESTIMATES_READY → COMPANY_SELECTED → FINAL_OFFER_PENDING → ACCEPTED/EXPIRED
 *
 * Vereinfachter MVP-Flow:
 * DRAFT → INVENTORY_CONFIRMED → ESTIMATES_READY → (Firma wählt Offer) → SUBMITTED → ACCEPTED/REJECTED
 */
public enum OfferStatus {
    // Initial
    DRAFT,                  // Offer angelegt, Video hochgeladen

    // Inventory Phase
    INVENTORY_PENDING,      // Warten auf KI-Analyse oder Kunden-Korrektur
    INVENTORY_CONFIRMED,    // Kunde hat Inventory bestätigt

    // Pricing Phase
    ESTIMATES_READY,        // Preisschätzungen von Firmen verfügbar
    ESTIMATES_EXPIRED,      // Schätzungen nicht mehr gültig

    // Selection Phase
    COMPANY_SELECTED,       // Kunde hat Firma(n) ausgewählt

    // Final Offer Phase
    FINAL_OFFER_PENDING,    // Warten auf finale Offerte der Firma
    FINAL_OFFER_SUBMITTED,  // Firma hat finale Offerte abgegeben

    // Completion
    ACCEPTED,               // Kunde hat Angebot angenommen
    REJECTED,               // Kunde hat Angebot abgelehnt
    EXPIRED,                // Angebot ist abgelaufen

    // Legacy/Alt
    READY_TO_SEND,          // [Alt] Bereit zum Versenden
    SENT,                   // [Alt] An Kunden versendet
    FAILED                  // [Alt] Fehler beim Verarbeiten
}
