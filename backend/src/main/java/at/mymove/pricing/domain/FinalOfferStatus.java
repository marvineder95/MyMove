package at.mymove.pricing.domain;

/**
 * Status einer FinalOffer.
 */
public enum FinalOfferStatus {
    DRAFT,      // Wird von der Firma bearbeitet
    SUBMITTED,  // An den Kunden übermittelt
    ACCEPTED,   // Vom Kunden angenommen
    REJECTED,   // Vom Kunden abgelehnt
    EXPIRED     // Nicht rechtzeitig angenommen
}
